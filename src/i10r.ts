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
    goLitreacha, idxList, Obj, TypeCheck, Value } from "./values";

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

const BrisException = "BRIS";
const CCException = "CC";
const SKIP_COUNT_LIM = 5000;

class Toradh {
    public luach: Value;
    constructor(v: Value) {
        this.luach = v;
    }
}

type Ref = (v: Value) => void;

export class Interpreter {
    public global: Environment = new Environment();
    private skipCnt: number = 0;
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
    public execStmt(st: Stmt, env: Environment): Promise<void> {
        if (this.skipCnt >= SKIP_COUNT_LIM) { // Every SKIP_COUNT_LIM statements put the next execution on the macrotask queue.
            this.skipCnt = 0;
            return new Promise((resolve) => setTimeout(resolve)).then(() => this.execStmt(st, env));
        }
        ++this.skipCnt;
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
    public refPostfix(p: P.Postfix, env: Environment): Promise<Ref> {
        if (p.ops.length > 0) {
            const ops: P.PostOp[] = p.ops.slice(0, p.ops.length - 1);
            const op: P.PostOp = p.ops[p.ops.length - 1];
            const subPost: P.Postfix = new P.Postfix(p.at, ops);
            return subPost.evalfn(env).then((val: Value) => {
                if ("args" in op) {
                    return Promise.reject(new RuntimeError("Ní feidir leat luach a thabhairt do gníomh"));
                }
                const arr: Value[] = Asserts.assertLiosta(val);
                return op.expr.evalfn(env).then((idxV: Value) => {
                    const idx: number = Asserts.assertNumber(idxV);
                    return (v: Value) => {
                        if (idx < 0 || idx >= arr.length) {
                            throw new RuntimeError(`Tá ${idx} thar teorainn an liosta`);
                        }
                        arr[idx] = v;
                    };
                });
            });
        }
        return this.refObjLookups(p.at, env);
    }
    public refObjLookups(o: P.ObjLookups, env: Environment): Promise<Ref> {
        if (o.attrs.length > 0) {
            const attrs: P.ObjLookups_$0[] = o.attrs.slice(1, o.attrs.length);
            const field: string = o.attrs[0].id.id;
            const subObj: P.ObjLookups = new P.ObjLookups(attrs, o.root);
            return subObj.evalfn(env).then((obj: Value) => {
                const val: Obj = Asserts.assertObj(obj);
                return (v: Value) => {
                    val.setAttr(field, v);
                };
            });
        }
        return this.refAtom(o.root, env);
    }
    public refAtom(a: P.Atom, env: Environment): Promise<Ref> {
        if (a.kind !== ASTKinds.ID) {
            return a.evalfn(env).then((v: Value) => {
                return Promise.reject(new RuntimeError("Ní feidir leat luach a thabhairt do " + goLitreacha(v)));
            });
        }
        return Promise.resolve((v: Value) => {
            env.assign(a.id, v);
        });
    }
    public execCCStmt(b: P.CCStmt): Promise<void> {
        return Promise.reject(CCException);
    }
    public execBrisStmt(b: P.BrisStmt): Promise<void> {
        return Promise.reject(BrisException);
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
            return b.exp.evalfn(env).then((v: Value) => Promise.reject(new Toradh(v)));
        }
        return Promise.reject(new Toradh(null));
    }
    public execGniomhStmt(fn: P.GniomhStmt, env: Environment): Promise<void> {
        return new Promise((r) => {
            const gníomh = this.makeGníomh(fn, env);
            env.define(fn.id.id, gníomh);
            r();
        });
    }
    public async execNuair(n: P.NuairStmt, env: Environment): Promise<void> {
        while (true) {
            const x = await n.expr.evalfn(env);
            if (!Checks.isTrue(x)) {
                break;
            }
            try {
                await this.execStmt(n.stmt, env);
            } catch (err) {
                if (err === BrisException) {
                    break;
                }
                if (err === CCException) {
                    continue;
                }
                throw err;
            }
        }
    }
    public async execLeStmt(n: P.LeStmt, env: Environment): Promise<void> {
        env = new Environment(env);
        const s = Asserts.assertNumber(await n.strt.evalfn(env));
        const e = Asserts.assertNumber(await n.end.evalfn(env));
        for (let i = s; i < e; ++i) {
            env.define(n.id.id, i);
            try {
                await this.execStmt(n.stmt, env);
            } catch (err) {
                if (err === BrisException) {
                    break;
                }
                if (err === CCException) {
                    continue;
                }
                throw err;
            }
        }
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
    public execAssgn(t: P.AssgnStmt, env: Environment): Promise<void> {
        return t.expr.evalfn(env).then((val: Value) => {
            return this.refPostfix(t.lhs, env).then((ref: Ref) => { ref(val); });
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
