import * as Asserts from "./asserts";
import { evalAsgnOp } from "./binops";
import * as Checks from "./checks";
import { CreatlachImpl } from "./creatlach";
import { RuntimeError, tagErrorLoc, undefinedError } from "./error";
import * as P from "./gen_parser";
import { ASTKinds } from "./gen_parser";
import { Gníomh, GníomhImpl } from "./gniomh";
import { Ref, Stmt, Value, repr } from "./values";
import { Context } from "./ctx";
import { BrisException, CCException } from "./consts";

// This library contains the main (slow) execution functions for execution of
// Setanta statements.

// Toradh is a result returned by an action.
export class Toradh {
    public luach: Value;
    constructor(v: Value) {
        this.luach = v;
    }
}

// IDEA for reconfiguring this, can we make this lazier? i.e. only chain next promise
// when preceding promise is in flight?
export function execStmts(stmts: Stmt[], ctx: Context): Promise<void> {
    const f = (x: Promise<void>, y: Stmt): Promise<void> =>
        x.then(() => execStmt(y, ctx));
    return stmts.reduce(f, Promise.resolve());
}

// execStmtBlock executes block statement.
function execStmtBlock(blk: P.BlockStmt, ctx: Context): Promise<void> {
    // Block statements create a new context.
    ctx = ctx.wrapped();
    return execStmts(blk.blk, ctx);
}

// execStmt executes a Setanta statement, and controls stopping of the program
// and tracking the skip count.
function execStmt(st: Stmt, ctx: Context): Promise<void> {
    return ctx.yieldExec(() => {
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
                // The default is a Setanta expression.
                if (st.qeval !== null) {
                    // Quick evaluation is possible.
                    st.qeval(ctx);
                    return Promise.resolve();
                }
                return st.evalfn(ctx).then();
        }
    });
}

// refPostfix creates a reference to assign to a postfix AST node.
function refPostfix(p: P.Postfix, ctx: Context): Promise<Ref> {
    // If there are no postops, just return a reference to the child node.
    if (p.ops.length === 0)
        return refObjLookups(p.at, ctx);

    // We differentiate between the outermost postfix ops and other postfix ops.
    // The outermost defines the reference, other postfix ops should be evaluated as before.
    // e.g. in the statement x[2][0] it is the 0'th element of `x[2]` that is being assigned to
    // To do this we create a copy of all but the last ops, and create a new Postfix AST node,
    // we evaluate this node and then create a reference to assign to it.

    const ops: P.PostOp[] = p.ops.slice(0, p.ops.length - 1);
    const op: P.PostOp = p.ops[p.ops.length - 1];
    const subPost: P.Postfix = new P.Postfix(p.start, p.at, ops, p.end);

    return subPost
        .evalfn(ctx)
        .then(val => {
            if ("args" in op)
                return Promise.reject(
                    new RuntimeError("Ní féidir leat luach a thabhairt do gníomh", p.start, p.end));
            Asserts.assertLiosta(val);
            return op.expr
                .evalfn(ctx)
                .then((idx: Value) => {
                    Asserts.assertNumber(idx);
                    return (v: Value) => {
                        if (idx < 0 || idx >= val.length)
                            throw new RuntimeError(`Tá ${idx} thar teorainn an liosta`,
                                p.start, p.end);
                        val[idx] = v;
                    };
                });
        });
}

// refObjLookups creates a reference for an object lookup.
function refObjLookups(o: P.ObjLookups, ctx: Context): Promise<Ref> {
    if (o.attrs.length === 0)
        return refAtom(o.root, ctx);

    // We use the same approach here as outlined in refPostfix
    const attrs: P.ObjLookups_$0[] = o.attrs.slice(1, o.attrs.length);
    const field: string = o.attrs[0].id.id;
    const subObj: P.ObjLookups = new P.ObjLookups(o.start, attrs, o.root, o.end);
    return subObj
        .evalfn(ctx)
        .then(obj => {
            Asserts.assertObjIntf(obj);
            return v => obj.setAttr(field, v);
        });
}

// refAtom creates a reference to an Atom. This only makes sense for variables.
// Throws an exception if it's not a variable.
// TODO Add static check for this.
function refAtom(a: P.Atom, ctx: Context): Promise<Ref> {
    // If it's not an ID we evaluate only for a better
    if (a.kind !== ASTKinds.ID)
        return a
            .evalfn(ctx)
            .then(v =>
                Promise.reject(
                    new RuntimeError("Ní féidir leat luach a thabhairt do " +
                        repr(v))));
    return Promise.resolve(v => {
        if(!a.depth.resolved)
            return Promise.reject(undefinedError(a.id));
        ctx.env.assign(a.id, a.depth, v);
    });
}

// TODO consider static check that chun-cinn and bris statements are not
// included outside of loops and that toradh isn't present outside of loops.

// execCCStmt throws a CCException. CCExceptions are caught by loops.
function execCCStmt(): Promise<void> { return Promise.reject(CCException); }

// execBrisStmt throws a BrisException. BrisExceptions are caught by loops.
function execBrisStmt(): Promise<void> { return Promise.reject(BrisException); }

// execCtlchStmt creates a Creatlach in the current scope.
function execCtlchStmt(b: P.CtlchStmt, ctx: Context): void {
    const gníomhs = new Map<string, Gníomh>();
    for (const gníomh of b.gniomhs) {
        const g = makeGníomh(gníomh, ctx);
        gníomhs.set(g.ainm, g);
    }
    if (b.tuis) {
        if(!b.tuis.id.depth.resolved)
            throw undefinedError(b.tuis.id.id);
        const tuis = ctx.env.get(b.tuis.id.id, b.tuis.id.depth);
        if (tuis === undefined || !(Checks.isCreatlach(tuis)))
            throw new RuntimeError(`Nil aon creatlach leis an ainm ${b.tuis.id.id}`,
                b.tuis.parentstart, b.tuis.parentend);
        const ctlch = new CreatlachImpl(b.id.id, gníomhs, tuis);
        ctx.env.define(b.id.id, ctlch);
    } else {
        const ctlch = new CreatlachImpl(b.id.id, gníomhs);
        ctx.env.define(b.id.id, ctlch);
    }
}

// execToradhStmt executes a toradh statement. Toradh statements involve
// throwing an exception containing the value being returned. This is caught
// by function calls.
function execToradhStmt(b: P.ToradhStmt, ctx: Context): Promise<void> {
    if (b.exp) {
        // Check if quick exec available.
        if (b.exp.qeval !== null)
            return Promise.reject(new Toradh(b.exp.qeval(ctx)));
        return b.exp
            .evalfn(ctx)
            .then(v => Promise.reject(new Toradh(v)));
    }
    return Promise.reject(new Toradh(null));
}

function execGniomhStmt(fn: P.GniomhStmt, ctx: Context): Promise<void> {
    const gníomh = makeGníomh(fn, ctx);
    ctx.env.define(fn.id.id, gníomh);
    return Promise.resolve();
}

async function execNuair(n: P.NuairStmt, ctx: Context): Promise<void> {
    for(;;){
        const x = await n.expr.evalfn(ctx);
        if (!Checks.isTrue(x))
            break;
        try {
            await execStmt(n.stmt, ctx);
        } catch (err) {
            if (err === BrisException)
                break;
            if (err === CCException)
                continue;
            throw err;
        }
    }
}

async function execLeStmt(n: P.LeStmt, ctx: Context): Promise<void> {
    const id = n.id;
    const s = await n.strt.evalfn(ctx);
    const e = await n.end.evalfn(ctx);
    Asserts.assertNumber(s);
    Asserts.assertNumber(e);

    // If end is >= the start we go down instead of up, unless the step size is
    // defined.
    let stp = e >= s ? 1 : -1;
    if (n.step !== null) {
        const stpsz = await n.step.step.evalfn(ctx);
        Asserts.assertNumber(stpsz);
        stp = stpsz;
    }

    ctx = ctx.wrapped();
    ctx.env.define(id.id, s);
    const dircheck = e >= s
        ? (a: number, b: number) => a < b
        : (a: number, b: number) => a > b;
    if(!id.depth.resolved)
        throw undefinedError(id.id);
    const depth = id.depth;
    for (let i = s; dircheck(i, e); i += stp) {
        ctx.env.assign(id.id, depth, i);
        try {
            await execStmt(n.stmt, ctx);
        } catch (err) {
            if (err === BrisException)
                break;
            if (err === CCException)
                continue;
            throw err;
        }
    }
}

function execMá(f: P.IfStmt, ctx: Context): Promise<void> {
    return f.expr
        .evalfn(ctx)
        .then(v => {
            if (Checks.isTrue(v))
                return execStmt(f.stmt, ctx);
            if (f.elsebranch === null)
                return;
            return execStmt(f.elsebranch.stmt, ctx);
        });
}

function execDefn(a: P.DefnStmt, ctx: Context): Promise<void> {
    // Try use quick strategy
    if (a.expr.qeval !== null) {
        const val = a.expr.qeval(ctx);
        ctx.env.define(a.id.id, val);
        return Promise.resolve();
    }
    return a.expr
        .evalfn(ctx)
        .then(val =>
            ctx.env.define(a.id.id, val));
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
        return t.expr
            .evalfn(ctx)
            .then(val =>
                refPostfix(t.lhs, ctx).then(ref => ref(val)))
            .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
    }
    // If both lhs and rhs are quick
    if (t.expr.qeval !== null && t.lhs.qeval !== null) {
        const dv = t.expr.qeval(ctx);
        const cur = t.lhs.qeval(ctx);
        return refPostfix(t.lhs, ctx)
            .then(ref =>
                evalAsgnOp(ref, cur, dv, t.op))
            .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));

    }
    // If only rhs is quick
    if (t.expr.qeval !== null) {
        const dv = t.expr.qeval(ctx);
        return refPostfix(t.lhs, ctx)
            .then(ref =>
                t.lhs
                    .evalfn(ctx)
                    .then(cur => evalAsgnOp(ref, cur, dv, t.op)))
            .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
    }
    // If only lhs is quick
    if (t.lhs.qeval !== null) {
        const cur = t.lhs.qeval(ctx);
        return t.expr
            .evalfn(ctx)
            .then(dv =>
                refPostfix(t.lhs, ctx)
                    .then(ref => evalAsgnOp(ref, cur, dv, t.op)))
            .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
    }
    // Neither are quick
    return t.expr
        .evalfn(ctx)
        .then(dv =>
            refPostfix(t.lhs, ctx)
                .then(ref =>
                    t.lhs
                        .evalfn(ctx)
                        .then(cur => evalAsgnOp(ref, cur, dv, t.op))))
        .catch(err => Promise.reject(tagErrorLoc(err, t.lstart, t.lend)));
}

function makeGníomh(fn: P.GniomhStmt, ctx: Context): Gníomh {
    const args = fn.args ? fn.args.ids : [];
    return new GníomhImpl(fn.id.id, fn.stmts, args, ctx);
}
