import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Environment } from "./env";
import { CSArgs, ListLit, ObjLookups, Postfix, PostOp, PostOp_2, Prefix } from "./gen_parser";
import { unescapeChars } from "./litreacha";
import { callFunc, idxList, qIdxList, Value } from "./values";

export type EvalFn = (env: Environment) => Value;
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

export function qLitreachaEval(lit: string): EvalFn {
    const x = unescapeChars(lit);
    return (env: Environment) => x;
}

export function qIntEval(lit: string): EvalFn {
    const x = parseFloat(lit);
    return (env: Environment) => x;
}

export function qBoolEval(lit: string): EvalFn {
    const x = lit === "fior" || lit === "fíor";
    return (env: Environment) => x;
}

export function qIdEval(id: string): EvalFn {
    return (env: Environment) => env.get(id);
}

export function qCSArgsEval(args: CSArgs): ((env: Environment) => Value[]) | null {
    const head = args.head;
    if (!isQuick(head)) {
        return null;
    }
    const ops: IsQuick[] = [head];
    for (const arg of args.tail) {
        if (!isQuick(arg.exp)) {
            return null;
        }
        ops.push(arg.exp);
    }
    return (env: Environment) => ops.map((x) => x.qeval(env));
}

export function qListLitEval(lit: ListLit): MaybeEv {
    return lit.els ? qCSArgsEval(lit.els) : () => [] ;
}

export function qObjLookupsEval(ol: ObjLookups): MaybeEv {
    if (!isQuick(ol.root)) {
        return null;
    }
    const arr = ol.attrs.slice().reverse();
    const h: IsQuick = ol.root;
    return (env: Environment): Value => {
        const rt: Value = h.qeval(env);
        return arr.reduce((x: Value, y): Value => {
            const obj = Asserts.assertObj(x);
            return obj.getAttr(y.id.id);
        }, rt);
    };
}

export function qPostfixArgsEval(pf: Postfix): MaybeEv {
    if (pf.ops.length === 0) {
        const childf = pf.at.qeval;
        return childf === null ? childf : childf.bind(pf.at);
    }
    // Check that root is quick
    const root = pf.at;
    if (!isQuick(root)) {
        return null;
    }
    // Check that all ops are quick
    // For a postop to be quick, it must be an array index, and the index
    // expression must also be quick.
    const quickOps: IsQuick[] = [];
    for (const op of pf.ops) {
        if ("args" in op) { // op is function call so not-quick
            return null;
        }
        const idx = op.expr;
        if (!isQuick(idx)) { // If idx can't be quick computed then this can't be either.
            return null;
        }
        quickOps.push(idx);
    }
    // Now all ops are quick, perform computation
    return (env: Environment) => {
        const rootVal = root.qeval(env);
        const f = (x: Value, y: IsQuick): Value => {
            return qIdxList(x, y.qeval(env));
        };
        return quickOps.reduce(f, rootVal);
    };
}

export function qPrefEval(p: Prefix): MaybeEv {
    if (!p.op) {
        const childF = p.pf.qeval;
        return childF === null ? null : childF.bind(p.pf);
    }
    const pf = p.pf;
    if (!isQuick(pf)) {
        return null;
    }
    return (env: Environment) => {
        const v = pf.qeval(env);
        return p.op === "-"
            ? -Asserts.assertNumber(v)
            : !Checks.isTrue(v);
    };
}
