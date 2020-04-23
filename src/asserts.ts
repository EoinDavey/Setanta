import * as Checks from "./checks";
import { RuntimeError } from "./error";
import { Obj, Callable, Comparable, goTéacs, ObjIntf, Value } from "./values";

export function assertNumber(x: Value): number {
    if (Checks.isNumber(x)) {
        return x;
    }
    throw new RuntimeError(`Ní uimhir é ${goTéacs(x)}`);
}

export function assertBool(x: Value): boolean {
    if (Checks.isBool(x)) {
        return x;
    }
    throw new RuntimeError(`Ní uimhir é ${goTéacs(x)}`);
}

export function assertLiosta(x: Value): Value[] {
    if (Checks.isLiosta(x)) {
        return x;
    }
    throw new RuntimeError(`Ní liosta é ${goTéacs(x)}`);
}

export function assertTéacs(x: Value): string {
    if (Checks.isTéacs(x)) {
        return x;
    }
    throw new RuntimeError(`Ní téacs é ${goTéacs(x)}`);
}

export function assertCallable(x: Value): Callable {
    if (Checks.isCallable(x)) {
        return x;
    }
    throw new RuntimeError(`Níl gníomh é ${goTéacs(x)}`);
}

export function assertObj(x: Value): Obj {
    if (Checks.isObj(x)) {
        return x;
    }
    throw new RuntimeError(`Ní rud é ${goTéacs(x)}`);
}

export function assertObjIntf(x: Value): ObjIntf {
    if (Checks.isObjIntf(x)) {
        return x;
    }
    throw new RuntimeError(`Ní rud é ${goTéacs(x)}`);
}

export function assertComparable(a: Value): Comparable {
    if (Checks.isComparable(a)) {
        return a;
    }
    throw new RuntimeError(`Ní féidir leat comparáid a dheanamh le ${goTéacs(a)}`);
}

export function assertIndexable(a: Value): ArrayLike<Value> {
    if (Checks.isLiosta(a) || Checks.isTéacs(a)) {
        return a;
    }
    throw new RuntimeError(`Ní liosta nó téacs é ${goTéacs(a)}`);
}
