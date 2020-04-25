import { Creatlach } from "./creatlach";
import { Obj, Callable, Comparable, ObjIntf, Value } from "./values";

export function isTrue(v: Value) {
    return v !== 0 && v !== false && v !== null;
}

export function isEqual(a: Value, b: Value): boolean {
    if (a === b)
        return true;
    if (isLiosta(a) && isLiosta(b) && a.length === b.length) {
        return a.map((x, i) => [x, b[i]]).every((x) => isEqual(x[0], x[1]));
    }
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
