import * as Asserts from "./asserts";
import { evalAsgnOp } from "./binops";
import * as Checks from "./checks";
import { CreatlachImpl } from "./creatlach";
import { RuntimeError, tagErrorLoc, undefinedError } from "./error";
import * as P from "./gen_parser";
import { ASTKinds } from "./gen_parser";
import { Gníomh, GníomhImpl } from "./gniomh";
import { ObjIntf, Ref, Stmt, Value, goTéacs } from "./values";
import { Context } from "./ctx";
import { BrisException, CCException, SKIP_COUNT_LIM, STOP } from "./consts";

export class Toradh {
    public luach: Value;
    constructor(v: Value) {
        this.luach = v;
    }
}

export function execStmts(stmts: Stmt[], ctx: Context): Promise<void> {
    const f = (x: Promise<void>, y: Stmt): Promise<void> => {
        return x.then(() => execStmt(y, ctx));
    };
    return stmts.reduce(f, Promise.resolve());
}

function execStmtBlock(blk: P.BlockStmt, ctx: Context): Promise<void> {
    ctx = new Context(ctx);
    return execStmts(blk.blk, ctx);
}

function execStmt(st: Stmt, ctx: Context): Promise<void> {
    if (ctx.stopped === true) {
        return Promise.reject(STOP);
    }
    // Every SKIP_COUNT_LIM statements put the next execution on the macrotask queue.
    if (ctx.skipCnt >= SKIP_COUNT_LIM) {
        ctx.skipCnt = 0;
        return new Promise(resolve => { setTimeout(resolve); }).then(() => execStmt(st, ctx));
    }
    ++ctx.skipCnt;
    switch (st.kind) {
        case ASTKinds.IfStmt:
            return execMá(st, ctx);
        case ASTKinds.BlockStmt:
            return execStmtBlock(st, ctx);
        case ASTKinds.AssgnStmt:
            return execAssgn(st, ctx);
        case ASTKinds.DefnStmt:
            return execDefn(st, ctx);
        case ASTKinds.NuairStmt:
            return execNuair(st, ctx);
        case ASTKinds.LeStmt:
            return execLeStmt(st, ctx);
        case ASTKinds.GniomhStmt:
            return execGniomhStmt(st, ctx);
        case ASTKinds.ToradhStmt:
            return execToradhStmt(st, ctx);
        case ASTKinds.CCStmt:
            return execCCStmt();
        case ASTKinds.BrisStmt:
            return execBrisStmt();
        case ASTKinds.CtlchStmt:
            return Promise.resolve(execCtlchStmt(st, ctx));
        default:
            if (st.qeval !== null) {
                st.qeval(ctx);
                return Promise.resolve();
            }
            return st.evalfn(ctx).then();
    }
}

function refPostfix(p: P.Postfix, ctx: Context): Promise<Ref> {
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
    return refObjLookups(p.at, ctx);
}

function refObjLookups(o: P.ObjLookups, ctx: Context): Promise<Ref> {
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
    return refAtom(o.root, ctx);
}

function refAtom(a: P.Atom, ctx: Context): Promise<Ref> {
    if (a.kind !== ASTKinds.ID) {
        return a.evalfn(ctx).then((v: Value) => {
            return Promise.reject(
                new RuntimeError("Ní féidir leat luach a thabhairt do " +
                    goTéacs(v)));
        });
    }
    return Promise.resolve((v: Value) => {
        if(!a.depth.resolved)
            return Promise.reject(undefinedError(a.id));
        ctx.env.assignAtDepth(a.id, a.depth.depth, v);
    });
}

function execCCStmt(): Promise<void> { return Promise.reject(CCException); }

function execBrisStmt(): Promise<void> { return Promise.reject(BrisException); }

function execCtlchStmt(b: P.CtlchStmt, ctx: Context) {
    const gníomhs = new Map<string, Gníomh>();
    for (const gníomh of b.gniomhs) {
        const g = makeGníomh(gníomh, ctx);
        gníomhs.set(g.ainm, g);
    }
    if (b.tuis) {
        if(!b.tuis.id.depth.resolved)
            throw undefinedError(b.tuis.id.id);
        const tuis = ctx.env.getAtDepth(b.tuis.id.id, b.tuis.id.depth.depth);
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

function execToradhStmt(b: P.ToradhStmt, ctx: Context): Promise<void> {
    if (b.exp) {
        if (b.exp.qeval !== null) { // Check if quick
            return Promise.reject(new Toradh(b.exp.qeval(ctx)));
        }
        return b.exp.evalfn(ctx).then((v: Value) => Promise.reject(new Toradh(v)));
    }
    return Promise.reject(new Toradh(null));
}

function execGniomhStmt(fn: P.GniomhStmt, ctx: Context): Promise<void> {
    return new Promise((r) => {
        const gníomh = makeGníomh(fn, ctx);
        ctx.env.define(fn.id.id, gníomh);
        r();
    });
}

async function execNuair(n: P.NuairStmt, ctx: Context): Promise<void> {
    for(;;){
        const x = await n.expr.evalfn(ctx);
        if (!Checks.isTrue(x)) {
            break;
        }
        try {
            await execStmt(n.stmt, ctx);
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

async function execLeStmt(n: P.LeStmt, ctx: Context): Promise<void> {
    const s = Asserts.assertNumber(await n.strt.evalfn(ctx));
    const e = Asserts.assertNumber(await n.end.evalfn(ctx));
    let stp = e >= s ? 1 : -1;
    if (n.step !== null) {
        stp = Asserts.assertNumber(await n.step.step.evalfn(ctx));
    }

    ctx = new Context(ctx);
    const dircheck = e >= s ? (a: number, b: number) => a < b : (a: number, b: number) => a > b;
    for (let i = s; dircheck(i, e); i += stp) {
        ctx.env.define(n.id.id, i);
        try {
            await execStmt(n.stmt, ctx);
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

function execMá(f: P.IfStmt, ctx: Context): Promise<void> {
    return f.expr.evalfn(ctx).then((v) => {
        if (Checks.isTrue(v)) {
            return execStmt(f.stmt, ctx);
        }
        if (!f.elsebranch) {
            return;
        }
        return execStmt(f.elsebranch.stmt, ctx);
    });
}

function execDefn(a: P.DefnStmt, ctx: Context): Promise<void> {
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

function execAssgn(t: P.AssgnStmt, ctx: Context): Promise<void> {
    // Direct assignment is taken care of separately due to no current value
    if (t.op === "=") {
        // Try quick evaluation of expression
        if (t.expr.qeval !== null) {
            const val = t.expr.qeval(ctx);
            return refPostfix(t.lhs, ctx).then((ref: Ref) => ref(val))
                .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
        }
        return t.expr.evalfn(ctx).then((val: Value) => {
            return refPostfix(t.lhs, ctx).then((ref: Ref) => ref(val));
        }) .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
    }
    // If both lhs and rhs are quick
    if (t.expr.qeval !== null && t.lhs.qeval !== null) {
        const dv = t.expr.qeval(ctx);
        const cur = t.lhs.qeval(ctx);
        return refPostfix(t.lhs, ctx).then((ref: Ref) =>
            evalAsgnOp(ref, cur, dv, t.op))
            .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));

    }
    // If only rhs is quick
    if (t.expr.qeval !== null) {
        const dv = t.expr.qeval(ctx);
        return refPostfix(t.lhs, ctx).then((ref: Ref) =>
            t.lhs.evalfn(ctx).then((cur: Value) => evalAsgnOp(ref, cur, dv, t.op)))
            .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
    }
    // If only lhs is quick
    if (t.lhs.qeval !== null) {
        const cur = t.lhs.qeval(ctx);
        return t.expr.evalfn(ctx).then((dv: Value) =>
            refPostfix(t.lhs, ctx).then((ref: Ref) =>
                evalAsgnOp(ref, cur, dv, t.op)))
                .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
    }
    // Neither are quick
    return t.expr.evalfn(ctx).then((dv: Value) =>
        refPostfix(t.lhs, ctx).then((ref: Ref) =>
            t.lhs.evalfn(ctx).then((cur: Value) => evalAsgnOp(ref, cur, dv, t.op))))
        .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
}

function makeGníomh(fn: P.GniomhStmt, ctx: Context): Gníomh {
    const args = fn.args ? fn.args.ids : [];
    return new GníomhImpl(fn.id.id, fn.stmts, args, ctx);
}
