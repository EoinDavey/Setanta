import { Creatlach } from "./creatlach";
import { Callable, Comparable, Obj, ObjIntf, Value } from "./values";

// This library implements type checks to differentiate
// the base value types in Setanta.

// IsTrue is the authority for what is considered true
// and false in Setanta.
export function isTrue(v: Value): boolean {
    return v !== 0 && v !== false && v !== null;
}

// isEqual is the authority on comparing two values in Setanta
// numbers, strings and booleans are compared as normal. Two lists
// are considered equal if each of their elements are equal, two objects
// are equal if they are literally the same object.
export function isEqual(a: Value, b: Value): boolean {
    if (a === b)
        return true;
    if (isLiosta(a) && isLiosta(b) && a.length === b.length)
        return a
            .map((x, i) => [x, b[i]])
            .every(([x, y]) => isEqual(x, y));
    return a === b;
}

export function isCallable(v: Value): v is Callable {
    return !(v === null || isNumber(v) || isBool(v) || isTéacs(v) || isLiosta(v)) && "call" in v;
}

export function isObj(v: Value): v is Obj {
    return isObjIntf(v) || isLiosta(v) || isTéacs(v);
}

export function isObjIntf(v: Value): v is ObjIntf {
    return !(v === null || isNumber(v) || isBool(v) || isTéacs(v) || isLiosta(v)) && "getAttr" in v;
}

export function isNumber(v: Value): v is number {
    return typeof v === "number";
}

export function isBool(v: Value): v is boolean {
    return typeof v === "boolean";
}

export function isTéacs(v: Value): v is string {
    return typeof v === "string";
}

export function isComparable(v: Value): v is Comparable {
    return isBool(v) || isNumber(v) || isTéacs(v);
}

export function isLiosta(v: Value): v is Value[] {
    return Array.isArray(v);
}

export function isCreatlach(v: Value): v is Creatlach {
    return v !== null && !(isBool(v) || isNumber(v) || isTéacs(v) || isLiosta(v)) && "aimsighGníomh" in v;
}
