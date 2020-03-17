import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Environment } from "./env";
import { CSArgs, ListLit, ObjLookups, Postfix, PostOp, PostOp_2, Prefix } from "./gen_parser";
import { unescapeChars } from "./litreacha";
import { callFunc, idxList, qIdxList, Value } from "./values";

export type EvalFn = (env: Environment) => Promise<Value>;

export function prefEval(p: Prefix): EvalFn {
    if (!p.op) {
        return p.pf.evalfn.bind(p.pf);
    }
    return (env: Environment) =>
        p.pf.evalfn(env).then((pf: Value) =>
            p.op === "-"
            ? -Asserts.assertNumber(pf)
            : !Checks.isTrue(pf));
}

export function csArgsEval(args: CSArgs): (env: Environment) => Promise<Value[]> {
    return (env: Environment) =>
    args.tail.reduce((x: Promise<Value[]>, y): Promise<Value[]> => {
        return x.then((ls) => {
            return y.exp.evalfn(env).then((v: Value) => {
                return ls.concat([v]);
            });
        });
    }, args.head.evalfn(env).then((x: Value) => [x]));
}

export function postfixArgsEval(pf: Postfix): EvalFn {
    if (pf.ops.length === 0) {
        return pf.at.evalfn.bind(pf.at);
    }
    return (env: Environment) => {
        const v = (x: Promise<Value>, y: PostOp): Promise<Value> => {
            return x.then((val) => {
                if ("args" in y) {
                    if (y.args) {
                        // Can use quick strategy
                        if (y.args.qeval !== null) {
                            const args = y.args.qeval(env);
                            return callFunc(val, args);
                        }
                        return y.args.evalfn(env).then((args: Value[]) => {
                            return callFunc(val, args);
                        });
                    }
                    return callFunc(val, []);
                }
                // Try using quick strategy
                if (y.expr.qeval !== null) {
                    return qIdxList(val, y.expr.qeval(env));
                }
                return idxList(val, y.expr.evalfn(env));
            });
        };
        return pf.ops.reduce(v, pf.at.evalfn(env));
    };
}

export function objLookupsEval(ol: ObjLookups): EvalFn {
    const arr = ol.attrs.slice().reverse();
    return (env: Environment) =>
        ol.root.evalfn(env).then((rt: Value) => {
            return arr.reduce((x: Value, y): Value => {
                const obj = Asserts.assertObj(x);
                return obj.getAttr(y.id.id);
            }, rt);
        });
}

export type QuickEvalFn = (env: Environment) => Value;
export type MaybeQuickEv = QuickEvalFn | null;
interface MaybeQuick {
    qeval: MaybeQuickEv;
}
export interface HasQuick {
    qeval: QuickEvalFn;
}

export function hasQuick(a: MaybeQuick): a is HasQuick {
    return a.qeval !== null;
}

export function qEvalToEval(fn: QuickEvalFn): EvalFn {
    return (env: Environment) => Promise.resolve(fn(env));
}

export function qLitreachaEval(lit: string): QuickEvalFn {
    const x = unescapeChars(lit);
    return (env: Environment) => x;
}

export function qIntEval(lit: string): QuickEvalFn {
    const x = parseFloat(lit);
    return (env: Environment) => x;
}

export function qBoolEval(lit: string): QuickEvalFn {
    const x = lit === "fior" || lit === "fíor";
    return (env: Environment) => x;
}

export function qIdEval(id: string): QuickEvalFn {
    return (env: Environment) => env.get(id);
}

export function qCSArgsEval(args: CSArgs): ((env: Environment) => Value[]) | null {
    const head = args.head;
    if (!hasQuick(head)) {
        return null;
    }
    const ops: HasQuick[] = [head];
    for (const arg of args.tail) {
        if (!hasQuick(arg.exp)) {
            return null;
        }
        ops.push(arg.exp);
    }
    return (env: Environment) => ops.map((x) => x.qeval(env));
}

export function qListLitEval(lit: ListLit): MaybeQuickEv {
    return lit.els ? qCSArgsEval(lit.els) : () => [] ;
}

export function qObjLookupsEval(ol: ObjLookups): MaybeQuickEv {
    if (!hasQuick(ol.root)) {
        return null;
    }
    const arr = ol.attrs.slice().reverse();
    const h: HasQuick = ol.root;
    return (env: Environment): Value => {
        const rt: Value = h.qeval(env);
        return arr.reduce((x: Value, y): Value => {
            const obj = Asserts.assertObj(x);
            return obj.getAttr(y.id.id);
        }, rt);
    };
}

export function qPostfixArgsEval(pf: Postfix): MaybeQuickEv {
    if (pf.ops.length === 0) {
        const childf = pf.at.qeval;
        return childf === null ? childf : childf.bind(pf.at);
    }
    // Check that root is quick
    const root = pf.at;
    if (!hasQuick(root)) {
        return null;
    }
    // Check that all ops are quick
    // For a postop to be quick, it must be an array index, and the index
    // expression must also be quick.
    const quickOps: HasQuick[] = [];
    for (const op of pf.ops) {
        if ("args" in op) { // op is function call so not-quick
            return null;
        }
        const idx = op.expr;
        if (!hasQuick(idx)) { // If idx can't be quick computed then this can't be either.
            return null;
        }
        quickOps.push(idx);
    }
    // Now all ops are quick, perform computation
    return (env: Environment) => {
        const rootVal = root.qeval(env);
        const f = (x: Value, y: HasQuick): Value => {
            return qIdxList(x, y.qeval(env));
        };
        return quickOps.reduce(f, rootVal);
    };
}

export function qPrefEval(p: Prefix): MaybeQuickEv {
    if (!p.op) {
        const childF = p.pf.qeval;
        return childF === null ? null : childF.bind(p.pf);
    }
    const pf = p.pf;
    if (!hasQuick(pf)) {
        return null;
    }
    return (env: Environment) => {
        const v = pf.qeval(env);
        return p.op === "-"
            ? -Asserts.assertNumber(v)
            : !Checks.isTrue(v);
    };
}
