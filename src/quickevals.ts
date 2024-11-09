import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { tagErrorLoc, undefinedError } from "./error";
import { Context } from "./ctx";
import { CSArgs, GniomhExpr, ID, ListLit, ObjLookups,
    PosInfo, Postfix, Prefix } from "./gen_parser";
import { unescapeChars } from "./teacs";
import { Value, idxList } from "./values";
import { getAttr } from "./obj";
import { GníomhImpl } from "./gniomh";

// This library implements the quick evaluation
// stragies for expressions.

// See evals.ts for an explanation for the need for
// quick and slow evaluation strategies.

export type EvalFn = (ctx: Context) => Value;

// Type for maybe having a quick strategy.
export type MaybeEv = EvalFn | null;

interface MaybeQuick {
    qeval: MaybeEv;
}

export interface IsQuick {
    qeval: EvalFn;
}

export function isQuick(a: MaybeQuick): a is IsQuick {
    return a.qeval !== null;
}

export function qGníomhEval(gn: GniomhExpr): EvalFn {
    const args = gn.args ? gn.args.ids : [];
    return (ctx: Context) =>
        new GníomhImpl("gan ainm", gn.stmts, args, ctx);
}

// qTéacsEval returns an eval function for a text literal.
export function qTéacsEval(lit: string, start: PosInfo, end: PosInfo): EvalFn {
    // We cache the result of unescaping after the first evaluation.
    // TODO Replace with computed property. I think I did this this way
    // to avoid triggering RuntimeErrors during parse time.
    let x: null | string = null;
    return () => {
        if(x !== null)
            return x;
        try {
            return (x = unescapeChars(lit));
        } catch(err) {
            throw tagErrorLoc(err, start, end);
        }
    };
}

export function qIntEval(lit: string): EvalFn {
    const x = parseFloat(lit);
    return () => x;
}

export function qBoolEval(lit: string): EvalFn {
    const x = lit === "fior" || lit === "fíor";
    return () => x;
}

export function qIdEval(id: ID): EvalFn {
    return (ctx: Context) =>  {
        try {
            if(!id.depth.resolved)
                throw undefinedError(id.id);
            return ctx.env.get(id.id, id.depth);
        } catch(err) {
            throw tagErrorLoc(err, id.start, id.end);
        }
    };
}

export function qCSArgsEval(args: CSArgs): ((ctx: Context) => Value[]) | null {
    const head = args.head;
    if (!isQuick(head))
        return null;
    const ops: IsQuick[] = [head];
    for (const arg of args.tail) {
        if (!isQuick(arg.exp))
            return null;
        ops.push(arg.exp);
    }
    return (ctx: Context) => {
        try {
            return ops.map((x) => x.qeval(ctx));
        } catch(err) {
            throw tagErrorLoc(err, args.start, args.end);
        }
    };
}

export function qListLitEval(lit: ListLit): MaybeEv {
    return lit.els ? lit.els.qeval : () => [] ;
}

// qObjLookupsEval possibly returns a quick evaluation function for
// an object lookups node.
export function qObjLookupsEval(ol: ObjLookups): MaybeEv {
    if (ol.attrs.length === 0) {
        const childf = ol.root.qeval;
        return childf === null ? null : childf.bind(ol.root);
    }
    if (!isQuick(ol.root))
        return null;
    const arr = ol.attrs.slice().reverse();
    const h: IsQuick = ol.root;
    return (ctx: Context): Value => {
        const rt: Value = h.qeval(ctx);
        try {
            return arr.reduce(
                (x, y) => {
                    Asserts.assertObj(x);
                    return getAttr(x, y.id.id);
                },
                rt,
            );
        } catch(err) {
            throw tagErrorLoc(err, ol.start, ol.end);
        }
    };
}

// qPostfixArgsEval possibly returns a quick evaluation function for a postfix
// operator node.
export function qPostfixArgsEval(pf: Postfix): MaybeEv {
    if (pf.ops.length === 0) {
        const childf = pf.at.qeval;
        return childf === null ? childf : childf.bind(pf.at);
    }
    // Check that root is quick
    const root = pf.at;
    if (!isQuick(root))
        return null;
    // Check that all ops are quick
    // For a postop to be quick, it must be an array index, and the index
    // expression must also be quick.
    const quickOps: IsQuick[] = [];
    for (const op of pf.ops) {
        if ("args" in op) // op is function call so not-quick
            return null;
        const idx = op.expr;
        if (!isQuick(idx)) // If idx can't be quick computed then this can't be either.
            return null;
        quickOps.push(idx);
    }
    // Now all ops are quick, perform computation
    return (ctx: Context) => {
        const rootVal = root.qeval(ctx);
        const f = (x: Value, y: IsQuick): Value => idxList(x, y.qeval(ctx));
        try {
            return quickOps.reduce(f, rootVal);
        } catch(err) {
            throw tagErrorLoc(err, pf.start, pf.end);
        }
    };
}

// qPrefEval possibly returns a quick evaluation function for a prefix
// operator node.
export function qPrefEval(p: Prefix): MaybeEv {
    if (!p.op) { // Can be shortcut
        const childF = p.pf.qeval;
        return childF === null ? null : childF.bind(p.pf);
    }
    const pf = p.pf;
    if (!isQuick(pf))
        return null;
    return (ctx: Context): number | boolean => {
        try {
            const v = pf.qeval(ctx);
            if(p.op === "-") {
                Asserts.assertNumber(v);
                return -v;
            }
            return !Checks.isTrue(v);
        } catch(err) {
            throw tagErrorLoc(err, p.start, p.end);
        }
    };
}
