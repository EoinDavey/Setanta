import * as Asserts from "./asserts";
import { evalAsgnOp } from "./binops";
import { GlobalBuiltins } from "./builtins";
import * as Checks from "./checks";
import { Creatlach, CreatlachImpl } from "./creatlach";
import { Environment } from "./env";
import { tagErrorLoc, RuntimeError, undefinedError } from "./error";
import * as P from "./gen_parser";
import { ASTKinds } from "./gen_parser";
import { Gníomh, GníomhImpl } from "./gniomh";
import { strcat, strrep, unescapeChars } from "./teacs";
import { Callable, callFunc, Comparable,
    goTéacs, idxList, ObjIntf, Ref, TypeCheck, Value } from "./values";
import { Context } from "./ctx";

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

const BrisException = "BRIS";
const CCException = "CC";
export const STOP = "STOP";
const SKIP_COUNT_LIM = 5000;

class Toradh {
    public luach: Value;
    constructor(v: Value) {
        this.luach = v;
    }
}

export class Interpreter {
    public global: Context;
    private skipCnt: number = 0;
    private stopped: boolean = false;
    constructor(externals?: [string[], Value][]) {
        const globalEnv = Environment.from(GlobalBuiltins);
        if (externals) {
            for (const ext of externals) {
                for (const a of ext[0]) {
                    globalEnv.define(a, ext[1]);
                }
            }
        }
        this.global = new Context(globalEnv);
    }
    public stop() {
        this.stopped = true;
    }
    public interpret(p: P.Program): Promise<void> {
        return this.execStmts(p.stmts, this.global).catch((err) => {
            if (err === STOP) {
                return;
            }
            throw err;
        });
    }
    public execStmts(stmts: Stmt[], ctx: Context): Promise<void> {
        const f = (x: Promise<void>, y: Stmt): Promise<void> => {
            return x.then(() => this.execStmt(y, ctx));
        };
        return stmts.reduce(f, Promise.resolve());
    }
    public execStmtBlock(blk: P.BlockStmt, ctx: Context): Promise<void> {
        ctx = Context.from(ctx);
        return this.execStmts(blk.blk, ctx);
    }
    public execStmt(st: Stmt, ctx: Context): Promise<void> {
        if (this.stopped) {
            return Promise.reject(STOP);
        }
        // Every SKIP_COUNT_LIM statements put the next execution on the macrotask queue.
        if (this.skipCnt >= SKIP_COUNT_LIM) {
            this.skipCnt = 0;
            return new Promise((resolve) => setTimeout(resolve)).then(() => this.execStmt(st, ctx));
        }
        ++this.skipCnt;
        switch (st.kind) {
            case ASTKinds.IfStmt:
                return this.execMá(st, ctx);
            case ASTKinds.BlockStmt:
                return this.execStmtBlock(st, ctx);
            case ASTKinds.AssgnStmt:
                return this.execAssgn(st, ctx);
            case ASTKinds.DefnStmt:
                return this.execDefn(st, ctx);
            case ASTKinds.NuairStmt:
                return this.execNuair(st, ctx);
            case ASTKinds.LeStmt:
                return this.execLeStmt(st, ctx);
            case ASTKinds.GniomhStmt:
                return this.execGniomhStmt(st, ctx);
            case ASTKinds.ToradhStmt:
                return this.execToradhStmt(st, ctx);
            case ASTKinds.CCStmt:
                return this.execCCStmt(st);
            case ASTKinds.BrisStmt:
                return this.execBrisStmt(st);
            case ASTKinds.CtlchStmt:
                return Promise.resolve(this.execCtlchStmt(st, ctx));
            default:
                if (st.qeval !== null) {
                    st.qeval(ctx);
                    return Promise.resolve();
                }
                return st.evalfn(ctx).then();
        }
    }
    public refPostfix(p: P.Postfix, ctx: Context): Promise<Ref> {
        if (p.ops.length > 0) {
            const ops: P.PostOp[] = p.ops.slice(0, p.ops.length - 1);
            const op: P.PostOp = p.ops[p.ops.length - 1];
            const subPost: P.Postfix = new P.Postfix(p.start, p.at, ops, p.end);
            return subPost.evalfn(ctx).then((val: Value) => {
                if ("args" in op) {
                    return Promise.reject(new RuntimeError("Ní féidir leat luach a thabhairt do gníomh", p.start, p.end));
                }
                const arr: Value[] = Asserts.assertLiosta(val);
                return op.expr.evalfn(ctx).then((idxV: Value) => {
                    const idx: number = Asserts.assertNumber(idxV);
                    return (v: Value) => {
                        if (idx < 0 || idx >= arr.length) {
                            throw new RuntimeError(`Tá ${idx} thar teorainn an liosta`,
                                p.start, p.end);
                        }
                        arr[idx] = v;
                    };
                });
            });
        }
        return this.refObjLookups(p.at, ctx);
    }
    public refObjLookups(o: P.ObjLookups, ctx: Context): Promise<Ref> {
        if (o.attrs.length > 0) {
            const attrs: P.ObjLookups_$0[] = o.attrs.slice(1, o.attrs.length);
            const field: string = o.attrs[0].id.id;
            const subObj: P.ObjLookups = new P.ObjLookups(o.start, attrs, o.root, o.end);
            return subObj.evalfn(ctx).then((obj: Value) => {
                const val: ObjIntf = Asserts.assertObjIntf(obj);
                return (v: Value) => {
                    val.setAttr(field, v);
                };
            });
        }
        return this.refAtom(o.root, ctx);
    }
    public refAtom(a: P.Atom, ctx: Context): Promise<Ref> {
        if (a.kind !== ASTKinds.ID) {
            return a.evalfn(ctx).then((v: Value) => {
                return Promise.reject(
                    new RuntimeError("Ní féidir leat luach a thabhairt do " +
                        goTéacs(v)));
            });
        }
        return Promise.resolve((v: Value) => {
            ctx.env.assign(a.id, v);
        });
    }
    public execCCStmt(b: P.CCStmt): Promise<void> {
        return Promise.reject(CCException);
    }
    public execBrisStmt(b: P.BrisStmt): Promise<void> {
        return Promise.reject(BrisException);
    }
    public execCtlchStmt(b: P.CtlchStmt, ctx: Context) {
        const gníomhs = new Map<string, Gníomh>();
        for (const gníomh of b.gniomhs) {
            const g = this.makeGníomh(gníomh, ctx);
            gníomhs.set(g.ainm, g);
        }
        if (b.tuis) {
            const tuis = ctx.env.get(b.tuis.id.id);
            if (!tuis || !(Checks.isCreatlach(tuis))) {
                throw new RuntimeError(`Nil aon creatlach leis an ainm ${b.tuis.id.id}`,
                    b.tuis.parentstart, b.tuis.parentend);
            }
            const ctlch = new CreatlachImpl(b.id.id, gníomhs, tuis);
            ctx.env.define(b.id.id, ctlch);
        } else {
            const ctlch = new CreatlachImpl(b.id.id, gníomhs);
            ctx.env.define(b.id.id, ctlch);
        }
    }
    public execToradhStmt(b: P.ToradhStmt, ctx: Context): Promise<void> {
        if (b.exp) {
            if (b.exp.qeval !== null) { // Check if quick
                return Promise.reject(new Toradh(b.exp.qeval(ctx)));
            }
            return b.exp.evalfn(ctx).then((v: Value) => Promise.reject(new Toradh(v)));
        }
        return Promise.reject(new Toradh(null));
    }
    public execGniomhStmt(fn: P.GniomhStmt, ctx: Context): Promise<void> {
        return new Promise((r) => {
            const gníomh = this.makeGníomh(fn, ctx);
            ctx.env.define(fn.id.id, gníomh);
            r();
        });
    }
    public async execNuair(n: P.NuairStmt, ctx: Context): Promise<void> {
        while (true) {
            const x = await n.expr.evalfn(ctx);
            if (!Checks.isTrue(x)) {
                break;
            }
            try {
                await this.execStmt(n.stmt, ctx);
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
    public async execLeStmt(n: P.LeStmt, ctx: Context): Promise<void> {
        ctx = Context.from(ctx);
        const s = Asserts.assertNumber(await n.strt.evalfn(ctx));
        const e = Asserts.assertNumber(await n.end.evalfn(ctx));
        let stp = e >= s ? 1 : -1;
        if (n.step !== null) {
            stp = Asserts.assertNumber(await n.step.step.evalfn(ctx));
        }
        const dircheck = e >= s ? (a: number, b: number) => a < b : (a: number, b: number) => a > b;
        for (let i = s; dircheck(i, e); i += stp) {
            ctx.env.define(n.id.id, i);
            try {
                await this.execStmt(n.stmt, ctx);
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
    public execMá(f: P.IfStmt, ctx: Context): Promise<void> {
        return f.expr.evalfn(ctx).then((v) => {
            if (Checks.isTrue(v)) {
                return this.execStmt(f.stmt, ctx);
            }
            if (!f.elsebranch) {
                return;
            }
            return this.execStmt(f.elsebranch.stmt, ctx);
        });
    }
    public execDefn(a: P.DefnStmt, ctx: Context): Promise<void> {
        if (ctx.env.has(a.id.id)) {
            return Promise.reject(
                new RuntimeError(`Tá ${a.id.id} sa scóip seo cheana féin`,
                a.idstart, a.idend));
        }
        // Try use quick strategy
        if (a.expr.qeval !== null) {
            const val = a.expr.qeval(ctx);
            ctx.env.define(a.id.id, val);
            return Promise.resolve();
        }
        return a.expr.evalfn(ctx).then((val) => {
            return ctx.env.define(a.id.id, val);
        });
    }
    public execAssgn(t: P.AssgnStmt, ctx: Context): Promise<void> {
        // Direct assignment is taken care of separately due to no current value
        if (t.op === "=") {
            // Try quick evaluation of expression
            if (t.expr.qeval !== null) {
                const val = t.expr.qeval(ctx);
                return this.refPostfix(t.lhs, ctx).then((ref: Ref) => ref(val))
                    .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
            }
            return t.expr.evalfn(ctx).then((val: Value) => {
                return this.refPostfix(t.lhs, ctx).then((ref: Ref) => ref(val));
            }) .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
        }
        // If both lhs and rhs are quick
        if (t.expr.qeval !== null && t.lhs.qeval !== null) {
            const dv = t.expr.qeval(ctx);
            const cur = t.lhs.qeval(ctx);
            return this.refPostfix(t.lhs, ctx).then((ref: Ref) =>
                evalAsgnOp(ref, cur, dv, t.op))
                .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));

        }
        // If only rhs is quick
        if (t.expr.qeval !== null) {
            const dv = t.expr.qeval(ctx);
            return this.refPostfix(t.lhs, ctx).then((ref: Ref) =>
                t.lhs.evalfn(ctx).then((cur: Value) => evalAsgnOp(ref, cur, dv, t.op)))
                .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
        }
        // If only lhs is quick
        if (t.lhs.qeval !== null) {
            const cur = t.lhs.qeval(ctx);
            return t.expr.evalfn(ctx).then((dv: Value) =>
                this.refPostfix(t.lhs, ctx).then((ref: Ref) =>
                    evalAsgnOp(ref, cur, dv, t.op)))
                    .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
        }
        // Neither are quick
        return t.expr.evalfn(ctx).then((dv: Value) =>
            this.refPostfix(t.lhs, ctx).then((ref: Ref) =>
                t.lhs.evalfn(ctx).then((cur: Value) => evalAsgnOp(ref, cur, dv, t.op))))
            .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
    }
    public evalCSIDs(ids: P.CSIDs): string[] {
        return [ids.head.id].concat(ids.tail.map((x) => x.id.id));
    }
    private makeGníomh(fn: P.GniomhStmt, ctx: Context): Gníomh {
        const execFn = (body: Stmt[], innerCtx: Context): Promise<Value> => {
            return this.execStmts(body, innerCtx).then((e) => null).catch((e) => {
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
        return new GníomhImpl(fn.id.id, fn.stmts, args, ctx, execFn);
    }
}
