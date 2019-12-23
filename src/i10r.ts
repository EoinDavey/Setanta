import * as Asserts from "./asserts";
import { Builtins } from "./builtins";
import * as Checks from "./checks";
import { Creatlach } from "./creatlach";
import { Environment } from "./env";
import { RuntimeError, undefinedError } from "./error";
import * as P from "./gen_parser";
import { ASTKinds } from "./gen_parser";
import { Gníomh } from "./gniomh";
import { strcat, strrep, unescapeChars } from "./litreacha";
import { Callable, callFunc, Comparable,
    goLitreacha, idxList, TypeCheck, Value } from "./values";

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

const BrisException = "BREAK";
const CCException = "CC";

class Toradh {
    public luach: Value;
    constructor(v: Value) {
        this.luach = v;
    }
}

export class Interpreter {
    public global: Environment = new Environment();
    constructor(externals?: Array<[string[], Value]>) {
        this.global = Environment.from(Builtins);
        if (externals) {
            for (const ext of externals) {
                for (const a of ext[0]) {
                    this.global.define(a, ext[1]);
                }
            }
        }
    }
    public interpret(p: P.Program): Promise<void> {
        return this.execStmts(p.stmts, this.global);
    }
    public execStmts(stmts: Stmt[], env: Environment): Promise<void> {
        const f = (x: Promise<void>, y: Stmt): Promise<void> => {
            return x.then(() => this.execStmt(y, env));
        };
        return stmts.reduce(f, Promise.resolve());
    }
    public execStmtBlock(blk: P.BlockStmt, env: Environment): Promise<void> {
        env = new Environment(env);
        return this.execStmts(blk.blk, env);
    }
    public execStmt(st: P.AsgnStmt | P.NonAsgnStmt, env: Environment): Promise<void> {
        switch (st.kind) {
            case ASTKinds.IfStmt:
                return this.execMá(st, env);
            case ASTKinds.BlockStmt:
                return this.execStmtBlock(st, env);
            case ASTKinds.AssgnStmt:
                return this.execAssgn(st, env);
            case ASTKinds.DefnStmt:
                return this.execDefn(st, env);
            case ASTKinds.NuairStmt:
                return this.execNuair(st, env);
            case ASTKinds.LeStmt:
                return this.execLeStmt(st, env);
            case ASTKinds.GniomhStmt:
                return this.execGniomhStmt(st, env);
            case ASTKinds.ToradhStmt:
                return this.execToradhStmt(st, env);
            case ASTKinds.CCStmt:
                return this.execCCStmt(st);
            case ASTKinds.BrisStmt:
                return this.execBrisStmt(st);
            case ASTKinds.CtlchStmt:
                return Promise.resolve(this.execCtlchStmt(st, env));
            default:
                return st.evalfn(env).then();
        }
    }
    public execCCStmt(b: P.CCStmt): Promise<void> {
        throw CCException;
    }
    public execBrisStmt(b: P.BrisStmt): Promise<void> {
        throw BrisException;
    }
    public execCtlchStmt(b: P.CtlchStmt, env: Environment) {
        const wrapEnv = new Environment(env);
        const gníomhs = new Map<string, Gníomh>();
        for (const gníomh of b.gniomhs) {
            const g = this.makeGníomh(gníomh, env);
            gníomhs.set(g.ainm, g);
        }
        if (b.tuis) {
            const tuis = env.get(b.tuis.id.id);
            if (!tuis || !(tuis instanceof Creatlach)) {
                throw new RuntimeError(`Nil aon creatlach leis an ainm ${b.tuis.id.id}`);
            }
            const ctlch = new Creatlach(b.id.id, gníomhs, tuis);
            env.define(b.id.id, ctlch);
        } else {
            const ctlch = new Creatlach(b.id.id, gníomhs);
            env.define(b.id.id, ctlch);
        }
    }
    public execToradhStmt(b: P.ToradhStmt, env: Environment): Promise<void> {
        if (b.exp) {
            return b.exp.evalfn(env).then((v) => { throw new Toradh(v); });
        }
        return new Promise((r) => { throw new Toradh(null); });
    }
    public execGniomhStmt(fn: P.GniomhStmt, env: Environment): Promise<void> {
        return new Promise((r) => {
            const gníomh = this.makeGníomh(fn, env);
            env.define(fn.id.id, gníomh);
            r();
        });
    }
    public execNuair(n: P.NuairStmt, env: Environment): Promise<void> {
        const step = (): Promise<void> => this.execStmt(n.stmt, env);
        const run: () => Promise<void> = () => n.expr.evalfn(env).then((x) => {
            if (!x) {
                return Promise.resolve();
            }
            return step().then(
                () => run(),
            ).catch((e) => {
                if (e === BrisException) {
                    return Promise.resolve();
                }
                if (e === CCException) {
                    return run();
                }
                throw e;
            });
        });
        return run();
    }
    public execLeStmt(n: P.LeStmt, env: Environment): Promise<void> {
        env = new Environment(env);

        return n.strt.evalfn(env).then(
            (st) => n.end.evalfn(env).then(
                (end) => {
                    const s = Asserts.assertNumber(st);
                    const e = Asserts.assertNumber(end);

                    const step = (): Promise<void> => this.execStmt(n.stmt, env);
                    const run: (i: number) => Promise<void> = (i: number) => {
                        if (i >= e) {
                            return Promise.resolve();
                        }
                        env.define(n.id.id, i);
                        return step().then(
                            () => run(i + 1),
                        ).catch((err) => {
                            if (err === BrisException) {
                                return Promise.resolve();
                            }
                            if (err === CCException) {
                                return run(i + 1);
                            }
                            throw err;
                        });
                    };
                    return run(s);
                },
            ),
        );
    }
    public execMá(f: P.IfStmt, env: Environment): Promise<void> {
        return f.expr.evalfn(env).then((v) => {
            if (Checks.isTrue(v)) {
                return this.execStmt(f.stmt, env);
            }
            if (!f.elsebranch) {
                return;
            }
            return this.execStmt(f.elsebranch.stmt, env);
        });
    }
    public execDefn(a: P.DefnStmt, env: Environment): Promise<void> {
        return a.expr.evalfn(env).then((val) => env.define(a.id.id, val));
    }
    public execAssgn(a: P.AssgnStmt, env: Environment) {
        return a.expr.evalfn(env).then((val) => {
            const ops: P.PostOp[] = a.id.ops;
            const f = (x: Promise<Value>, op: P.PostOp): Promise<Value> => {
                return x.then((v) => {
                    if ("args" in op) {
                        if (op.args) {
                            return op.args.evalfn(env).then((args) => {
                                return callFunc(v, args);
                            });
                        }
                        return callFunc(v, []);
                    }
                    return idxList(v, op.expr.evalfn(env));
                });
            };
            if (ops.length) {
                const v: Promise<Value> = ops.slice(0, ops.length - 1).reduce(f,
                    Promise.resolve(a.id.id.evalfn(env)));
                return v.then((rt) => {
                    const op = ops[ops.length - 1];
                    if (!("expr" in op)) {
                        throw new RuntimeError(`Cannot assign to function`);
                    }
                    const arr = Asserts.assertLiosta(rt);
                    return op.expr.evalfn(env).then((x) => {
                        const idx = Asserts.assertNumber(x);
                        arr[idx] = val;
                    });
                });
            } else {
                env.assign(a.id.id.id, val);
            }
        });
    }
    public evalCSIDs(ids: P.CSIDs): string[] {
        return [ids.head.id].concat(ids.tail.map((x) => x.id.id));
    }
    private makeGníomh(fn: P.GniomhStmt, env: Environment): Gníomh {
            const execFn = (body: Stmt[], innerEnv: Environment): Promise<Value> => {
                return this.execStmts(body, innerEnv).then((e) => null).catch((e) => {
                    if (e instanceof Toradh) {
                        return e.luach;
                    }
                    if (e !== BrisException) {
                        throw e;
                    }
                    return null;
                });
            };
            const args = fn.args ? this.evalCSIDs(fn.args) : [];
            return new Gníomh(fn.id.id, fn.stmts, args, env, execFn);
    }
}
