import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { Context } from "./ctx";
import { RuntimeError, tagErrorLoc } from "./error";
import { EvalFn } from "./evals";
import { And, Or, PosInfo } from "./gen_parser";
import { cat, repeat } from "./liosta";
import { strcat, strrep } from "./teacs";
import { IsQuick, MaybeEv as MaybeQuickEv, isQuick } from "./quickevals";
import { Comparable, Ref, TypeCheck, Value, repr } from "./values";

// This library implements the functions for evaluating binary operations.
// Both their standard forms (e.g. 1 + 2, "hello " + "world") in both quick and
// promise based versions, as well as the assignment statement logic (e.g. x += 2).
// See evals.ts for explanation of quick vs slow evals

// Evalable represents an object that can be evaluated.
interface Evalable {evalfn: EvalFn; qeval: MaybeQuickEv; }

// BinOp => Binary Operation
type BinOp = (a: Value, b: Value) => Value;

// BinOpEntry is an interface for an entry in the BinOp table.
interface BinOpEntry { lcheck: TypeCheck; rcheck: TypeCheck; op: BinOp; }

// The Or (|) and the And (&) operators get special treatment here as they are
// shortcut operators. i.e. a() | b() won't evaluate b() if a() returns true.

// orBinOp returns the slow evaluation function of the or (|) operator.
export function orBinOp(or: Or): EvalFn {
    // If there is only one operand, return the eval function of the only element.
    if (or.tail.length === 0)
        return or.head.evalfn.bind(or.head);
    return (ctx: Context) =>
        or.tail
            .reduce(
                (x: Promise<Value>, y): Promise<Value> =>
                    x.then(val => Checks.isTrue(val) ? val : y.trm.evalfn(ctx)),
                or.head.evalfn(ctx),
            )
            .catch(err => Promise.reject(tagErrorLoc(err, or.start, or.end)));
}

// andBinOp returns the slow evaluation function of the and (&) operator.
export function andBinOp(and: And): EvalFn {
    if (and.tail.length === 0)
        return and.head.evalfn.bind(and.head);
    return (ctx: Context) =>
        and.tail
            .reduce(
                (x: Promise<Value>, y): Promise<Value> =>
                    x.then(val => !Checks.isTrue(val) ? val : y.trm.evalfn(ctx)),
                and.head.evalfn(ctx),
            )
            .catch(err => Promise.reject(tagErrorLoc(err, and.start, and.end)));
}

// binOpEvalFn returns the slow evaluation function for generic binary operators (not & or |).
export function binOpEvalFn(obj: {head: Evalable, tail: {trm: Evalable, op: string}[], start: PosInfo, end: PosInfo}): EvalFn {
    if (obj.tail.length === 0)
        return obj.head.evalfn.bind(obj.head);
    return (ctx: Context) =>
        obj.tail.reduce(
            (x: Promise<Value>, y): Promise<Value> =>
                x.then((a: Value) =>
                    y.trm
                        .evalfn(ctx)
                        .then((b: Value) =>
                            evalBinOp(a, b, y.op, obj.start, obj.end))),
            obj.head.evalfn(ctx),
        );
}

// orQuickBinOp returns the quick evaluation function for the or (|) operator
// it returns null if it is not possible.
export function orQuickBinOp(or: Or): MaybeQuickEv {
    if (or.tail.length === 0) {
        // If only one operand, return quick eval fn of child if it exists
        const childF = or.head.qeval;
        return childF === null ? null : childF.bind(or.head);
    }
    // Ensure first operand is quick
    const head = or.head;
    if (!isQuick(head))
        return null;
    // Ensure all remaining are quick and put them in list
    const tail: IsQuick[] = [];
    for (const op of or.tail) {
        const trm = op.trm;
        if (!isQuick(trm))
            return null;
        tail.push(trm);
    }
    return (ctx: Context) => {
        let acc = head.qeval(ctx);
        for (const op of tail) {
            if (Checks.isTrue(acc))
                return acc;
            acc = op.qeval(ctx);
        }
        return acc;
    };
}

// orQuickBinOp returns the quick evaluation function for the and (&) operator
// it returns null if it is not possible.
export function andQuickBinOp(and: And): MaybeQuickEv {
    if (and.tail.length === 0) {
        // If only one operand, return quick eval fn of child if it exists
        const childF = and.head.qeval;
        return childF === null ? null : childF.bind(and.head);
    }
    // Ensure first operand is quick
    const head = and.head;
    if (!isQuick(head))
        return null;
    // Ensure all remaining are quick and put them in list
    const tail: IsQuick[] = [];
    for (const op of and.tail) {
        const trm = op.trm;
        if (!isQuick(trm))
            return null;
        tail.push(trm);
    }
    return (ctx: Context) => {
        let acc = head.qeval(ctx);
        for (const op of tail) {
            if (!Checks.isTrue(acc))
                return acc;
            acc = op.qeval(ctx);
        }
        return acc;
    };
}

// orQuickBinOp returns the quick evaluation function for generic binary op,
// it returns null if it is not possible.
export function binOpQuickEvalFn(obj: {head: Evalable, tail: {trm: Evalable, op: string}[], start: PosInfo, end: PosInfo}): MaybeQuickEv {
    if (obj.tail.length === 0) {
        const childF = obj.head.qeval;
        return childF === null ? null : childF.bind(obj.head);
    }
    // Check if all operands are quick
    const head = obj.head;
    if (!isQuick(head))
        return null;
    interface QuickOp {
        trm: IsQuick;
        op: string;
    }
    const ops: QuickOp[] = [];
    for (const op of obj.tail) {
        if (!isQuick(op.trm))
            return null;
        ops.push(op as QuickOp); // Safe as checked non-null in isQuick check
    }
    return (ctx: Context) => {
        return ops
            .reduce(
                (x: Value, y): Value => {
                    const b = y.trm.qeval(ctx);
                    return evalBinOp(x, b, y.op, obj.start, obj.end);
                },
                head.qeval(ctx),
            );
    };
}

// makeBinOp takes a binary operand function and two assertions functions and returns a BinOp.
function makeBinOp<L extends Value, R extends Value>(lassert: (v: Value) => asserts v is L,
                                                     rassert: (v: Value) => asserts v is R,
                                                     op: (a: L, b: R) => Value): BinOp {
    return (a: Value, b: Value) =>  {
        lassert(a); rassert(b);
        return op(a, b);
    };
}

// numBinOpEntry returns a BinOp for operations that act on numbers.
function numBinOpEntry(f: (a: number, b: number) => Value): BinOpEntry {
    return {
        lcheck: Checks.isNumber,
        op: makeBinOp(Asserts.assertNumber, Asserts.assertNumber, f),
        rcheck: Checks.isNumber,
    };
}

// compBinOpEntry returns a BinOp for operations that act on comparables.
function compBinOpEntry(f: (a: Comparable, b: Comparable) => Value): BinOpEntry {
    return {
        lcheck: Checks.isComparable,
        op: makeBinOp(Asserts.assertComparable, Asserts.assertComparable, f),
        rcheck: Checks.isComparable,
    };
}

// binOpTable is the table of all built-in binary operators.
// It is a map from strings to arrays of BinOpEntrys.
// A BinOpEntry consists of two type check functions for the
// left and right operands, if the operands pass the type check
// functions, then the operator is applied.
const binOpTable: Map<string, BinOpEntry[]> = new Map([
    ["+", [
        numBinOpEntry((a, b) => a + b),
        {
            lcheck: Checks.isLiosta,
            op: makeBinOp(Asserts.assertLiosta, Asserts.assertLiosta, cat),
            rcheck: Checks.isLiosta,
        },
        {
            lcheck: Checks.isTéacs,
            op: makeBinOp(Asserts.assertTéacs, Asserts.assertTéacs, strcat),
            rcheck: Checks.isTéacs,
        },
    ]],
    ["-", [numBinOpEntry((a, b) => a - b)]],
    ["*", [
        numBinOpEntry((a, b) => a * b),
        {
            lcheck: Checks.isLiosta,
            op: makeBinOp(Asserts.assertLiosta, Asserts.assertNumber, repeat),
            rcheck: Checks.isNumber,
        },
        {
            lcheck: Checks.isTéacs,
            op: makeBinOp(Asserts.assertTéacs, Asserts.assertNumber, strrep),
            rcheck: Checks.isNumber,
        },
    ]],
    ["%", [numBinOpEntry((a, b) => {
        const val = a % b;
        return val < 0 ? val + b : val;
    })]],
    ["/", [numBinOpEntry((a, b) => {
        if (b === 0)
            throw new RuntimeError(`Roinnt ar 0`);
        return a / b;
    })]],
    ["//", [numBinOpEntry((a, b) => {
        if (b === 0)
            throw new RuntimeError(`Roinnt ar 0`);
        return Math.floor(a / b);
    })]],
    ["<", [compBinOpEntry((a, b) => a < b)]],
    [">", [compBinOpEntry((a, b) => a > b)]],
    ["<=", [compBinOpEntry((a, b) => a <= b)]],
    [">=", [compBinOpEntry((a, b) => a >= b)]],
    ["==", [{
        lcheck: () => true, // All values pass this check.
        op: makeBinOp((x: Value): Value => x,
            (x: Value): Value => x,
            (a: Value, b: Value): boolean => Checks.isEqual(a, b)),
        rcheck: () => true, // All values pass this check.
    }]],
    ["!=", [{
        lcheck: () => true, // All values pass this check.
        op: makeBinOp((x: Value): Value => x, // All values get asserted fine.
            (x: Value): Value => x,
            (a: Value, b: Value): boolean => !Checks.isEqual(a, b)),
        rcheck: () => true, // All values pass this check.
    }]],
]);

// evalBinOp lookups up the available operations from the binOpTable,
// it tries each of the type checks and returns the result when a match is found.
function evalBinOp(a: Value, b: Value, op: string, start: PosInfo, end: PosInfo): Value {
    const g = binOpTable.get(op);
    if (g) {
        for (const x of g) {
            if (x.lcheck(a) && x.rcheck(b)) {
                try {
                    return x.op(a, b);
                } catch(err) {
                    throw tagErrorLoc(err, start, end);
                }
            }
        }
    }
    throw new RuntimeError(`Ní féidir leat ${repr(op)} a úsaid le ${repr(a)} agus ${repr(b)}`, start, end);
}

// A type for assignment operators (e.g. +=, -=)
type AsgnOp = (ref: Ref, cur: Value, dv: Value) => void;

interface AsgnOpEntry { lcheck: TypeCheck; rcheck: TypeCheck; op: AsgnOp; }

function makeAsgnOp<L extends Value, R extends Value>(lassert: (v: Value) => asserts v is L,
                                                      rassert: (v: Value) => asserts v is R,
                                                      op: (a: L, b: R) => Value): AsgnOp {
    return (ref: Ref, a: Value, b: Value) =>  {
        lassert(a); rassert(b);
        return ref(op(a, b));
    };
}

function numAsgnOpEntry(f: (a: number, b: number) => Value): AsgnOpEntry {
    return {
        lcheck: Checks.isNumber,
        op: makeAsgnOp(Asserts.assertNumber, Asserts.assertNumber, f),
        rcheck: Checks.isNumber,
    };
}

const asgnOpTable: Map<string, AsgnOpEntry[]> = new Map([
    ["+=", [
        numAsgnOpEntry((a, b) => a + b),
        {
            lcheck: Checks.isLiosta,
            op: (ref: Ref, cur: Value, d: Value) => {
                Asserts.assertLiosta(cur);
                Asserts.assertLiosta(d);
                ref(cur.concat(d));
            },
            rcheck: Checks.isLiosta,
        },
        {
            lcheck: Checks.isTéacs,
            op: makeAsgnOp(Asserts.assertTéacs, Asserts.assertTéacs, strcat),
            rcheck: Checks.isTéacs,
        },
    ]],
    ["-=", [numAsgnOpEntry((a, b) => a - b)]],
    ["/=", [
        numAsgnOpEntry((a, b) => {
            if (b === 0)
                throw new RuntimeError(`Roinnt ar 0`);
            return a / b;
        }),
    ]],
    ["//=", [
        numAsgnOpEntry((a, b) => {
            if (b === 0)
                throw new RuntimeError(`Roinnt ar 0`);
            return Math.floor(a / b);
        }),
    ]],
    ["%=", [numAsgnOpEntry((a, b) => {
        const val = a % b;
        return val < 0 ? val + b : val;
    })]],
    ["*=", [
        numAsgnOpEntry((a, b) => a * b),
        {
            lcheck: Checks.isLiosta,
            op: makeAsgnOp(Asserts.assertLiosta, Asserts.assertNumber, repeat),
            rcheck: Checks.isNumber,
        },
        {
            lcheck: Checks.isTéacs,
            op: makeAsgnOp(Asserts.assertTéacs, Asserts.assertNumber, strrep),
            rcheck: Checks.isNumber,
        },
    ]],
]);

// evalAsgnOp is the same as evalBinOp, but for assignment.
export function evalAsgnOp(ref: Ref, cur: Value, dv: Value, op: string): void {
    const g = asgnOpTable.get(op);
    if (g) {
        for (const x of g)
            if (x.lcheck(cur) && x.rcheck(dv))
                return x.op(ref, cur, dv);
    }
    throw new RuntimeError(`Ní féidir leat ${repr(op)} a úsáid le ${repr(cur)} agus ${repr(dv)}`);
}
