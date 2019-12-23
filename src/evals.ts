import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Environment } from "./env";
import { CSArgs, ObjLookups, Postfix, PostOp, Prefix } from "./gen_parser";
import { callFunc, idxList, Value } from "./values";

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
                        return y.args.evalfn(env).then((args: Value[]) => {
                            return callFunc(val, args);
                        });
                    }
                    return callFunc(val, []);
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
