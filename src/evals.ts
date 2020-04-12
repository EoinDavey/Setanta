import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Environment } from "./env";
import { CSArgs, ListLit, ObjLookups, Postfix, PostOp, PostOp_2, Prefix } from "./gen_parser";
import * as Quick from "./quickevals";
import { callFunc, idxList, qIdxList, Value } from "./values";
import { tagErrorLoc } from "./error";

export type EvalFn = (env: Environment) => Promise<Value>;

export function qEvalToEval(q: Quick.EvalFn): EvalFn {
    return (env: Environment) => Promise.resolve(q(env));
}

export function prefEval(p: Prefix): EvalFn {
    if (!p.op) {
        return p.pf.evalfn.bind(p.pf);
    }
    return (env: Environment) =>
        p.pf.evalfn(env).then((pf: Value) =>
            p.op === "-"
            ? -Asserts.assertNumber(pf)
            : !Checks.isTrue(pf))
                .catch(err => Promise.reject(tagErrorLoc(err, p.start, p.end)));
}

export function csArgsEval(args: CSArgs): (env: Environment) => Promise<Value[]> {
    return (env: Environment) =>
    args.tail.reduce((x: Promise<Value[]>, y): Promise<Value[]> => {
        return x.then((ls) => {
            return y.exp.evalfn(env).then((v: Value) => {
                return ls.concat([v]);
            });
        });
    }, args.head.evalfn(env).then((x: Value) => [x]))
    .catch(err => Promise.reject(tagErrorLoc(err, args.start, args.end)));
}

export function postfixArgsEval(pf: Postfix): EvalFn {
    if (pf.ops.length === 0) {
        return pf.at.evalfn.bind(pf.at);
    }
    return (env: Environment) => {
        const v = (x: Promise<Value>, y: PostOp): Promise<Value> => {
            return x.then((val) => {
                if ("args" in y) { // this op is a function call
                    if (y.args) { // Are there args?
                        // Can use quick strategy
                        if (y.args.qeval !== null) {
                            const args = y.args.qeval(env);
                            return callFunc(val, args);
                        }
                        return y.args.evalfn(env).then((args: Value[]) => {
                            return callFunc(val, args);
                        });
                    }
                    // No args so supply empty list
                    return callFunc(val, []);
                }
                // This op is an array index
                // Try using quick strategy
                if (y.expr.qeval !== null) {
                    return qIdxList(val, y.expr.qeval(env));
                }
                return idxList(val, y.expr.evalfn(env));
            });
        };
        return pf.ops.reduce(v, pf.at.evalfn(env))
            .catch(err => Promise.reject(tagErrorLoc(err, pf.start, pf.end)));
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
        }).catch(err => Promise.reject(tagErrorLoc(err, ol.start, ol.end)));
}
