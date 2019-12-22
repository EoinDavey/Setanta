import * as Asserts from "./asserts";
import { Builtins } from "./builtins";
import * as Checks from "./checks";
import { Creatlach } from "./creatlach";
import { Environment } from "./env";
import { RuntimeError, undefinedError } from "./error";
import * as P from "./gen_parser";
import { ASTKinds } from "./gen_parser";
import { Gníomh } from "./gniomh";
import { cat, repeat } from "./liosta";
import { strcat, strrep, unescapeChars } from "./litreacha";
import { Callable, callFunc, Comparable,
    goLitreacha, TypeCheck, Value } from "./values";

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

type BinOp = (a: Value, b: Value) => Value;

const BrisException = "BREAK";
const CCException = "CC";

class Toradh {
    public luach: Value;
    constructor(v: Value) {
        this.luach = v;
    }
}

interface BinOpEntry { lcheck: TypeCheck; rcheck: TypeCheck; op: BinOp; }

function makeBinOp<L extends Value, R extends Value>(lassert: (v: Value) => L,
                                                     rassert: (v: Value) => R, op: (a: L, b: R) => Value): BinOp {
        return (a: Value, b: Value) =>  {
            return op(lassert(a), rassert(b));
        };
}

function numBinOpEntry(f: (a: number, b: number) => Value): BinOpEntry {
    return {
        lcheck : Checks.isNumber,
        op : makeBinOp(Asserts.assertNumber, Asserts.assertNumber, f),
        rcheck: Checks.isNumber,
    };
}

function compBinOpEntry(f: (a: Comparable, b: Comparable) => Value): BinOpEntry {
    return {
        lcheck : Checks.isComparable,
        op : makeBinOp(Asserts.assertComparable, Asserts.assertComparable, f),
        rcheck: Checks.isComparable,
    };
}

const binOpTable: Map<string, BinOpEntry[]> = new Map([
    ["+", [
        numBinOpEntry((a, b) => a + b),
        {
            lcheck : Checks.isLiosta,
            op : makeBinOp(Asserts.assertLiosta, Asserts.assertLiosta, cat),
            rcheck : Checks.isLiosta,
        },
        {
            lcheck : Checks.isLitreacha,
            op : makeBinOp(Asserts.assertLitreacha, Asserts.assertLitreacha, strcat),
            rcheck : Checks.isLitreacha,
        },
    ]],
    ["-", [numBinOpEntry((a, b) => a - b)]],
    ["*", [
        numBinOpEntry((a, b) => a * b),
        {
            lcheck : Checks.isLiosta,
            op : makeBinOp(Asserts.assertLiosta, Asserts.assertNumber, repeat),
            rcheck : Checks.isNumber,
        },
        {
            lcheck : Checks.isLitreacha,
            op : makeBinOp(Asserts.assertLitreacha, Asserts.assertNumber, strrep),
            rcheck : Checks.isNumber,
        },
    ]],
    ["%", [numBinOpEntry((a, b) => a % b)]],
    ["/", [numBinOpEntry((a, b) => {
                if (b === 0) {
                    throw new RuntimeError(`Division by zero`);
                }
                return a / b;
        })]],
    ["<", [compBinOpEntry((a, b) => a < b)]],
    [">", [compBinOpEntry((a, b) => a > b)]],
    ["<=", [compBinOpEntry((a, b) => a <= b)]],
    [">=", [compBinOpEntry((a, b) => a >= b)]],
]);

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
                return this.execCtlchStmt(st, env);
            default:
                return this.evalExpr(st, env).then();
        }
    }
    public execCCStmt(b: P.CCStmt): Promise<void> {
        throw CCException;
    }
    public execBrisStmt(b: P.BrisStmt): Promise<void> {
        throw BrisException;
    }
    public async execCtlchStmt(b: P.CtlchStmt, env: Environment): Promise<void> {
        const wrapEnv = new Environment(env);
        const gníomhs = new Map<string, Gníomh>();
        for (const gníomh of b.gniomhs) {
            const g = this.makeGníomh(gníomh, env);
            gníomhs.set(g.ainm, g);
        }
        const ctlch = new Creatlach(b.id.id, gníomhs);
        env.define(b.id.id, ctlch);
    }
    public execToradhStmt(b: P.ToradhStmt, env: Environment): Promise<void> {
        if (b.exp) {
            return this.evalExpr(b.exp, env).then((v) => { throw new Toradh(v); });
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
        const run: () => Promise<void> = () => this.evalExpr(n.expr, env).then((x) => {
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

        return this.evalExpr(n.strt, env).then(
            (st) => this.evalExpr(n.end, env).then(
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
        return this.evalExpr(f.expr, env).then((v) => {
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
        return this.evalExpr(a.expr, env).then((val) => env.define(a.id.id, val));
    }
    public execAssgn(a: P.AssgnStmt, env: Environment) {
        return this.evalExpr(a.expr, env).then((val) => {
            const ops: P.PostOp[] = a.id.ops;
            const f = (x: Promise<Value>, op: P.PostOp): Promise<Value> => {
                return x.then((v) => {
                    if ("args" in op) {
                        if (op.args) {
                            return this.evalCSArgs(op.args, env).then((args) => {
                                return callFunc(v, args);
                            });
                        }
                        return callFunc(v, []);
                    }
                    return this.idxList(v, op.expr, env);
                });
            };
            if (ops.length) {
                const v: Promise<Value> = ops.slice(0, ops.length - 1).reduce(f,
                    Promise.resolve(this.evalID(a.id.id, env)));
                return v.then((rt) => {
                    const op = ops[ops.length - 1];
                    if (!("expr" in op)) {
                        throw new RuntimeError(`Cannot assign to function`);
                    }
                    const arr = Asserts.assertLiosta(rt);
                    return this.evalExpr(op.expr, env).then((x) => {
                        const idx = Asserts.assertNumber(x);
                        arr[idx] = val;
                    });
                });
            } else {
                env.assign(a.id.id.id, val);
            }
        });
    }
    public evalBinOp(a: Value, b: Value, op: string): Value {
        const g = binOpTable.get(op);
        if (g) {
            for (const x of g) {
                if (x.lcheck(a) && x.rcheck(b)) {
                    return x.op(a, b);
                }
            }
        }
        throw new RuntimeError(`Can't apply ${goLitreacha(op)} to ${goLitreacha(a)} and ${goLitreacha(b)}`);
    }
    public evalExpr(expr: P.Expr, env: Environment): Promise<Value> {
        return this.evalAnd(expr, env);
    }
    public evalAnd(o: P.And, env: Environment): Promise<Value> {
        return o.tail.reduce((x: Promise<Value>, y: P.And_$0): Promise<Value> =>
            x.then((val) => {
                if (!val) {
                    return val;
                }
                return this.evalOr(y.trm, env);
            })
            , this.evalOr(o.head, env));
    }
    public evalOr(o: P.Or, env: Environment): Promise<Value> {
        return o.tail.reduce((x: Promise<Value>, y: P.Or_$0): Promise<Value> =>
            x.then((val) => {
                if (val) {
                    return val;
                }
                return this.evalEq(y.trm, env);
            })
            , this.evalEq(o.head, env));
    }
    public evalEq(e: P.Eq, env: Environment): Promise<Value> {
        return e.tail.reduce((x: Promise<Value>, y: P.Eq_$0): Promise<Value> =>
            x.then((a) => this.evalComp(y.trm, env).then((b) => {
                const eq = Checks.isEqual(a, b);
                return y.op === "==" ? eq : !eq;
            }))
        , this.evalComp(e.head, env));
    }
    public evalComp(p: P.Comp, env: Environment): Promise<Value> {
        return p.tail.reduce((x: Promise<Value>, y: P.Comp_$0): Promise<Value> =>
            x.then((a) => this.evalSum(y.trm, env).then((b) => this.evalBinOp(a, b, y.op))),
            this.evalSum(p.head, env));
    }
    public evalSum(p: P.Sum, env: Environment): Promise<Value> {
        return p.tail.reduce((x: Promise<Value>, y: P.Sum_$0): Promise<Value> =>
            x.then((a) => this.evalProduct(y.trm, env).then((b) => this.evalBinOp(a, b, y.op))),
            this.evalProduct(p.head, env));
    }
    public evalProduct(p: P.Product, env: Environment): Promise<Value> {
        return p.tail.reduce((x: Promise<Value>, y: P.Product_$0): Promise<Value> =>
            x.then((a) => this.evalPrefix(y.trm, env).then((b) => this.evalBinOp(a, b, y.op)))
            , this.evalPrefix(p.head, env));
    }
    public evalPostfix(p: P.Postfix, env: Environment): Promise<Value> {
        const v = (x: Promise<Value>, y: P.PostOp): Promise<Value> => {
            return x.then((val) => {
                if ("args" in y) {
                    if (y.args) {
                        return this.evalCSArgs(y.args, env).then((args) => {
                            return callFunc(val, args);
                        });
                    }
                    return callFunc(val, []);
                }
                return this.idxList(val, y.expr, env);
            });
        };
        return p.ops.reduce(v, this.evalObjLookups(p.at, env));
    }
    public evalPrefix(p: P.Prefix, env: Environment): Promise<Value> {
        return this.evalPostfix(p.pf, env).then((pf) => {
            if (p.op === "-") {
                return -Asserts.assertNumber(pf);
            }
            if (p.op === "!") {
                return !Checks.isTrue(pf);
            }
            return pf;
        });
    }
    public idxList(x: Value, idx: P.Expr, env: Environment): Promise<Value> {
        const ls = Asserts.assertIndexable(x);
        return this.evalExpr(idx, env).then((v) => {
            v = Asserts.assertNumber(v);
            if (v < 0 || v >= ls.length) {
                throw new RuntimeError(`Index ${goLitreacha(v)} out of bounds`);
            }
            return ls[v];
        });
    }
    public evalAtom(at: P.Atom, env: Environment): Promise<Value> {
        switch (at.kind) {
            case ASTKinds.ID:
                return Promise.resolve(this.evalID(at, env));
            case ASTKinds.Int:
                return Promise.resolve(this.evalInt(at));
            case ASTKinds.Bool:
                return Promise.resolve(this.evalBool(at));
            case ASTKinds.ListLit:
                return Promise.resolve(this.evalListLit(at, env));
            case ASTKinds.Litreacha:
                return Promise.resolve(this.evalLitreacha(at));
            case ASTKinds.Neamhni:
                return Promise.resolve(null);
        }
        return this.evalExpr(at.trm, env);
    }
    public evalObjLookups(o: P.ObjLookups, env: Environment): Promise<Value> {
        return this.evalAtom(o.root, env).then((rt) => {
            const arr = o.attrs.slice().reverse();
            return arr.reduce((x: Value, y: P.ObjLookups_$0): Value => {
                    const obj = Asserts.assertObj(x);
                    return obj.getAttr(y.id.id);
            }, rt);
        });
    }
    public evalLitreacha(ls: P.Litreacha): Value {
        return unescapeChars(ls.val);
    }
    public evalListLit(ls: P.ListLit, env: Environment): Promise<Value> {
        return ls.els ? this.evalCSArgs(ls.els, env) : Promise.resolve([]);
    }
    public evalCSArgs(args: P.CSArgs, env: Environment): Promise<Value[]> {
        return args.tail.reduce((x: Promise<Value[]>, y: P.CSArgs_$0): Promise<Value[]> => {
            return x.then((ls) => {
                return this.evalExpr(y.exp, env).then((v) => {
                    return ls.concat([v]);
                });
            });
        }, this.evalExpr(args.head, env).then((x) => [x]));
    }
    public evalCSIDs(ids: P.CSIDs): string[] {
        return [ids.head.id].concat(ids.tail.map((x) => x.id.id));
    }
    public evalID(id: P.ID, env: Environment): Value {
        return env.get(id.id);
    }
    public evalBool(b: P.Bool): boolean {
        return b.bool === "fíor" || b.bool === "fior";
    }
    public evalInt(i: P.Int): number {
        return parseInt(i.int, 10);
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
