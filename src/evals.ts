import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Context } from "./ctx";
import { CSArgs, ObjLookups, PostOp, Postfix, Prefix } from "./gen_parser";
import * as Quick from "./quickevals";
import { Value, callFunc, idxList } from "./values";
import { tagErrorLoc } from "./error";
import { getAttr } from "./obj";

// This library contains the main (slow) evaluation functions for evaluation of
// Setanta expression.
//
// Why are these the slow evaluations? Why not always use quickevals.ts?
//
// The API for actions in Setanta is interface { call: (args: Value[]) => Promise<Value> }
// We use promise as the return type as Setanta supports blocking operations such as
// `codladh` and `ceist`. As Promise is the return type, we incur a lot of overhead.
// For example, an sum expression could be `x + 1` or `x + f()`. In the case of
// `x + 1` we could evaluate this without promises, but for `x + f()` we need to use a
// Promise. During parse time we identify which expression can be done without the
// Promise API and use the quick (Promise-less) evaluation strategies. Otherwise we use
// these slower Promise based evaluation strategies.
//
// Why do these function return functions, instead of directly computing the result?
//
// We store the evaluation functions on the AST, this allows us to compute shorcut skips
// over nodes that are not needed during parse time.
// In the AST returned from the parser, a simple integer literal has several nodes.
// e.g. And -> Or -> Eq -> Comp -> Sum -> Product -> Prefix -> Postfix -> ObjLookups -> Atom -> Int
// Direct computing on the AST would require recursing the whole way down this tree every time,
// which would be wasteful and slow. Instead we store a .evalfn and .qevalfn computed property
// on each node, skipping needless nodes so the evaluation goes straight to the Int node.

export type EvalFn = (ctx: Context) => Promise<Value>;

// qEvalToEval converts a quick evaluation function to a slow evaluation
// function.
export function qEvalToEval(q: Quick.EvalFn): EvalFn {
    return (ctx: Context) => Promise.resolve(q(ctx));
}

// prefEval returns an evaluation function for prefix operands (-, !).
export function prefEval(p: Prefix): EvalFn {
    if (!p.op)
        return p.pf.evalfn.bind(p.pf);
    return (ctx: Context) =>
        p.pf.evalfn(ctx)
            .then((pf: Value) => {
                // Prefix op is either "-" or "!"
                if(p.op === "-") {
                    Asserts.assertNumber(pf);
                    return -pf;
                }
                return !Checks.isTrue(pf);
            })
            .catch(err => Promise.reject(tagErrorLoc(err, p.start, p.end)));
}

export function csArgsEval(args: CSArgs): (ctx: Context) => Promise<Value[]> {
    return (ctx: Context) =>
        args.tail
            .reduce(
                (x: Promise<Value[]>, y): Promise<Value[]> =>
                    x.then(ls =>
                        y.exp
                            .evalfn(ctx)
                            .then(v => ls.concat([v]))
                    ),
                args.head.evalfn(ctx).then((x: Value) => [x])
            )
            .catch(err => Promise.reject(tagErrorLoc(err, args.start, args.end)));
}

// postfixArgsEval evaluates postfix operators ([], ())
export function postfixArgsEval(pf: Postfix): EvalFn {
    if (pf.ops.length === 0)
        return pf.at.evalfn.bind(pf.at);
    return (ctx: Context) => {
        const v = (x: Promise<Value>, y: PostOp): Promise<Value> => {
            return x.then(val => {
                if ("args" in y) { // this op is a function call
                    if (y.args !== null) { // Are there args?
                        // Can use quick strategy?
                        if (y.args.qeval !== null) {
                            const args = y.args.qeval(ctx);
                            return ctx.yieldExec(() => callFunc(val, args));
                        }
                        return y.args
                            .evalfn(ctx)
                            .then(args => ctx.yieldExec(() => callFunc(val, args)));
                    }
                    // No args so supply empty list
                    return callFunc(val, []);
                }
                // This op is an array index
                // Try using quick strategy
                if (y.expr.qeval !== null)
                    return idxList(val, y.expr.qeval(ctx));
                return y.expr
                    .evalfn(ctx)
                    .then(idx => idxList(val, idx));
            });
        };
        return pf.ops.reduce(v, pf.at.evalfn(ctx))
            .catch(err => Promise.reject(tagErrorLoc(err, pf.start, pf.end)));
    };
}

// objLookupsEval evaluates an object lookup operator (@)
export function objLookupsEval(ol: ObjLookups): EvalFn {
    // Get reversed list of attribute names
    const arr = ol.attrs.slice().reverse();

    // Evaluate the root object, then lookup attributes in a chain.
    return (ctx: Context) =>
        ol.root
            .evalfn(ctx)
            .then(root =>
                arr.reduce(
                    (obj: Value, y): Value => {
                        Asserts.assertObj(obj);
                        return getAttr(obj, y.id.id);
                    },
                    root
                )
            )
            .catch(err => Promise.reject(tagErrorLoc(err, ol.start, ol.end)));
}
