import * as Checks from "./checks";
import { RuntimeError } from "./error";
import { Callable, Comparable, Obj, ObjIntf, Value, repr } from "./values";

export function assertNumber(x: Value): asserts x is number {
    if (!Checks.isNumber(x))
        throw new RuntimeError(`Ní uimhir é ${repr(x)}`);
}

export function assertBool(x: Value): asserts x is boolean {
    if (!Checks.isBool(x))
        throw new RuntimeError(`Ní bool é ${repr(x)}`);
}

export function assertLiosta(x: Value): asserts x is Value[] {
    if (!Checks.isLiosta(x))
        throw new RuntimeError(`Ní liosta é ${repr(x)}`);
}

export function assertTéacs(x: Value): asserts x is string {
    if (!Checks.isTéacs(x))
        throw new RuntimeError(`Ní téacs é ${repr(x)}`);
}

export function assertCallable(x: Value): asserts x is Callable {
    if (!Checks.isCallable(x))
        throw new RuntimeError(`Níl gníomh é ${repr(x)}`);
}

export function assertObj(x: Value): asserts x is Obj {
    if (!Checks.isObj(x))
        throw new RuntimeError(`Ní rud é ${repr(x)}`);
}

export function assertObjIntf(x: Value): asserts x is ObjIntf {
    if (!Checks.isObjIntf(x))
        throw new RuntimeError(`Ní rud é ${repr(x)}`);
}

export function assertComparable(a: Value): asserts a is Comparable {
    if (!Checks.isComparable(a))
        throw new RuntimeError(`Ní féidir leat comparáid a dheanamh le ${repr(a)}`);
}

export function assertIndexable(a: Value): asserts a is (string | Value[]) {
    if (!Checks.isLiosta(a) && !Checks.isTéacs(a))
        throw new RuntimeError(`Ní liosta nó téacs é ${repr(a)}`);
}
