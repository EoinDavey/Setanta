import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Context } from "./ctx";
import { CSArgs, ObjLookups, PostOp, Postfix, Prefix } from "./gen_parser";
import * as Quick from "./quickevals";
import { Value, callFunc, idxList, qIdxList } from "./values";
import { tagErrorLoc } from "./error";
import { getAttr } from "./obj";

export type EvalFn = (ctx: Context) => Promise<Value>;

export function qEvalToEval(q: Quick.EvalFn): EvalFn {
    return (ctx: Context) => Promise.resolve(q(ctx));
}

export function prefEval(p: Prefix): EvalFn {
    if (!p.op) {
        return p.pf.evalfn.bind(p.pf);
    }
    return (ctx: Context) =>
        p.pf.evalfn(ctx).then((pf: Value) => {
            if(p.op === "-") {
                Asserts.assertNumber(pf);
                return -pf;
            }
            return !Checks.isTrue(pf);
        }).catch(err => Promise.reject(tagErrorLoc(err, p.start, p.end)));
}

export function csArgsEval(args: CSArgs): (ctx: Context) => Promise<Value[]> {
    return (ctx: Context) =>
    args.tail.reduce((x: Promise<Value[]>, y): Promise<Value[]> => {
        return x.then((ls) => {
            return y.exp.evalfn(ctx).then((v: Value) => {
                return ls.concat([v]);
            });
        });
    }, args.head.evalfn(ctx).then((x: Value) => [x]))
    .catch(err => Promise.reject(tagErrorLoc(err, args.start, args.end)));
}

export function postfixArgsEval(pf: Postfix): EvalFn {
    if (pf.ops.length === 0) {
        return pf.at.evalfn.bind(pf.at);
    }
    return (ctx: Context) => {
        const v = (x: Promise<Value>, y: PostOp): Promise<Value> => {
            return x.then((val) => {
                if ("args" in y) { // this op is a function call
                    if (y.args) { // Are there args?
                        // Can use quick strategy
                        if (y.args.qeval !== null) {
                            const args = y.args.qeval(ctx);
                            return callFunc(val, args);
                        }
                        return y.args.evalfn(ctx).then((args: Value[]) => {
                            return callFunc(val, args);
                        });
                    }
                    // No args so supply empty list
                    return callFunc(val, []);
                }
                // This op is an array index
                // Try using quick strategy
                if (y.expr.qeval !== null) {
                    return qIdxList(val, y.expr.qeval(ctx));
                }
                return idxList(val, y.expr.evalfn(ctx));
            });
        };
        return pf.ops.reduce(v, pf.at.evalfn(ctx))
            .catch(err => Promise.reject(tagErrorLoc(err, pf.start, pf.end)));
    };
}

export function objLookupsEval(ol: ObjLookups): EvalFn {
    const arr = ol.attrs.slice().reverse();
    return (ctx: Context) =>
        ol.root.evalfn(ctx).then((rt: Value) => {
            return arr.reduce((obj: Value, y): Value => {
                Asserts.assertObj(obj);
                return getAttr(obj, y.id.id);
            }, rt);
        }).catch(err => Promise.reject(tagErrorLoc(err, ol.start, ol.end)));
}
