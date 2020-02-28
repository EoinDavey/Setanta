import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Environment } from "./env";
import { RuntimeError } from "./error";
import { EvalFn } from "./evals";
import { And, Or } from "./gen_parser";
import { cat, repeat } from "./liosta";
import { strcat, strrep } from "./litreacha";
import { Comparable, goLitreacha, Ref, TypeCheck, Value } from "./values";

interface IEvalable {evalfn: EvalFn; }

type BinOp = (a: Value, b: Value) => Value;

interface BinOpEntry { lcheck: TypeCheck; rcheck: TypeCheck; op: BinOp; }

export function orBinOp(or: Or): EvalFn {
    if (or.tail.length === 0) {
        return or.head.evalfn.bind(or.head);
    }
    return (env: Environment) =>
        or.tail.reduce((x: Promise<Value>, y): Promise<Value> =>
            x.then((val) => {
                if (Checks.isTrue(val)) {
                    return val;
                }
                return y.trm.evalfn(env);
            })
            , or.head.evalfn(env));
}

export function andBinOp(and: And): EvalFn {
    if (and.tail.length === 0) {
        return and.head.evalfn.bind(and.head);
    }
    return (env: Environment) =>
        and.tail.reduce((x: Promise<Value>, y): Promise<Value> =>
            x.then((val) => {
                if (!Checks.isTrue(val)) {
                    return val;
                }
                return y.trm.evalfn(env);
            })
            , and.head.evalfn(env));
}

export function binOpEvalFn(obj: {head: IEvalable, tail: Array<{trm: IEvalable, op: string}>}): EvalFn {
    if (obj.tail.length === 0) {
        return obj.head.evalfn.bind(obj.head);
    }
    return (env: Environment) =>
        obj.tail.reduce((x: Promise<Value>, y): Promise<Value> =>
            x.then((a: Value) =>
                y.trm.evalfn(env).then((b: Value) =>
                    evalBinOp(a, b, y.op))),
            obj.head.evalfn(env));
}

function makeBinOp<L extends Value, R extends Value>(lassert: (v: Value) => L,
                                                     rassert: (v: Value) => R, op: (a: L, b: R) => Value): BinOp {
    return (a: Value, b: Value) =>  {
        return op(lassert(a), rassert(b));
    };
}

function numBinOpEntry(f: (a: number, b: number) => Value): BinOpEntry {
    return {
        lcheck : Checks.isNumber,
        op : makeBinOp(Asserts.assertNumber, Asserts.assertNumber, f),
        rcheck: Checks.isNumber,
    };
}

function compBinOpEntry(f: (a: Comparable, b: Comparable) => Value): BinOpEntry {
    return {
        lcheck : Checks.isComparable,
        op : makeBinOp(Asserts.assertComparable, Asserts.assertComparable, f),
        rcheck: Checks.isComparable,
    };
}

const binOpTable: Map<string, BinOpEntry[]> = new Map([
    ["+", [
        numBinOpEntry((a, b) => a + b),
        {
            lcheck : Checks.isLiosta,
            op : makeBinOp(Asserts.assertLiosta, Asserts.assertLiosta, cat),
            rcheck : Checks.isLiosta,
        },
        {
            lcheck : Checks.isLitreacha,
            op : makeBinOp(Asserts.assertLitreacha, Asserts.assertLitreacha, strcat),
            rcheck : Checks.isLitreacha,
        },
    ]],
    ["-", [numBinOpEntry((a, b) => a - b)]],
    ["*", [
        numBinOpEntry((a, b) => a * b),
        {
            lcheck : Checks.isLiosta,
            op : makeBinOp(Asserts.assertLiosta, Asserts.assertNumber, repeat),
            rcheck : Checks.isNumber,
        },
        {
            lcheck : Checks.isLitreacha,
            op : makeBinOp(Asserts.assertLitreacha, Asserts.assertNumber, strrep),
            rcheck : Checks.isNumber,
        },
    ]],
    ["%", [numBinOpEntry((a, b) => {
        let val = a % b;
        if (val < 0) {
            val += b;
        }
        return val;
    })]],
    ["/", [numBinOpEntry((a, b) => {
        if (b === 0) {
            throw new RuntimeError(`Roinn le 0`);
        }
        return a / b;
    })]],
    ["//", [numBinOpEntry((a, b) => {
        if (b === 0) {
            throw new RuntimeError(`Roinn le 0`);
        }
        return Math.floor(a / b);
    })]],
    ["<", [compBinOpEntry((a, b) => a < b)]],
    [">", [compBinOpEntry((a, b) => a > b)]],
    ["<=", [compBinOpEntry((a, b) => a <= b)]],
    [">=", [compBinOpEntry((a, b) => a >= b)]],
    ["==", [{
        lcheck : (x: Value): boolean => true, // All values pass this check.
        op : makeBinOp((x: Value): Value => x,
            (x: Value): Value => x,
            (a: Value, b: Value): boolean => Checks.isEqual(a, b)),
        rcheck : (x: Value): boolean => true, // All values pass this check.
    }]],
    ["!=", [{
        lcheck : (x: Value): boolean => true, // All values pass this check.
        op : makeBinOp((x: Value): Value => x, // All values get asserted fine.
            (x: Value): Value => x,
            (a: Value, b: Value): boolean => !Checks.isEqual(a, b)),
        rcheck : (x: Value): boolean => true, // All values pass this check.
    }]],
]);

function evalBinOp(a: Value, b: Value, op: string): Value {
    const g = binOpTable.get(op);
    if (g) {
        for (const x of g) {
            if (x.lcheck(a) && x.rcheck(b)) {
                return x.op(a, b);
            }
        }
    }
    throw new RuntimeError(`Ní feider leat ${goLitreacha(op)} a úsaid le ${goLitreacha(a)} agus ${goLitreacha(b)}`);
}

type AsgnOp = (ref: Ref, cur: Value, dv: Value) => void;

interface AsgnOpEntry { lcheck: TypeCheck; rcheck: TypeCheck; op: AsgnOp; }

function makeAsgnOp<L extends Value, R extends Value>(lassert: (v: Value) => L,
                                                      rassert: (v: Value) => R, op: (a: L, b: R) => Value): AsgnOp {
    return (ref: Ref, a: Value, b: Value) =>  {
        return ref(op(lassert(a), rassert(b)));
    };
}

function numAsgnOpEntry(f: (a: number, b: number) => Value): AsgnOpEntry {
    return {
        lcheck : Checks.isNumber,
        op : makeAsgnOp(Asserts.assertNumber, Asserts.assertNumber, f),
        rcheck: Checks.isNumber,
    };
}

const asgnOpTable: Map<string, AsgnOpEntry[]> = new Map([
    ["+=", [
        numAsgnOpEntry((a, b) => a + b),
        {
            // Using += on a list is more efficient than x = x + y, due to use of in place `push`
            lcheck: Checks.isLiosta,
            op: (ref: Ref, cur: Value, d: Value) => {
                const cv = Asserts.assertLiosta(cur);
                const dv = Asserts.assertLiosta(d);
                cv.push(...dv);
            },
            rcheck: Checks.isLiosta,
        },
        {
            lcheck: Checks.isLitreacha,
            op: makeAsgnOp(Asserts.assertLitreacha, Asserts.assertLitreacha, strcat),
            rcheck: Checks.isLitreacha,
        },
    ]],
    ["-=", [numAsgnOpEntry((a, b) => a - b)]],
    ["/=", [numAsgnOpEntry((a, b) => a / b)]],
    ["%=", [numAsgnOpEntry((a, b) => {
        let val = a % b;
        if (val < 0) {
            val += b;
        }
        return val;
    })]],
    ["*=", [
        numAsgnOpEntry((a, b) => a * b),
        {
            lcheck: Checks.isLiosta,
            op: makeAsgnOp(Asserts.assertLiosta, Asserts.assertNumber, repeat),
            rcheck: Checks.isNumber,
        },
        {
            lcheck: Checks.isLitreacha,
            op: makeAsgnOp(Asserts.assertLitreacha, Asserts.assertNumber, strrep),
            rcheck: Checks.isNumber,
        },
    ]],
]);

export function evalAsgnOp(ref: Ref, cur: Value, dv: Value, op: string) {
    const g = asgnOpTable.get(op);
    if (g) {
        for (const x of g) {
            if (x.lcheck(cur) && x.rcheck(dv)) {
                return x.op(ref, cur, dv);
            }
        }
    }
    throw new RuntimeError(`Ní feider leat ${goLitreacha(op)} a úsaid le ${goLitreacha(cur)} agus ${goLitreacha(dv)}`);
}
