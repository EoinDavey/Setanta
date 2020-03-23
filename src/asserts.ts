import * as Checks from "./checks";
import { RuntimeError } from "./error";
import { Callable, Comparable, goLitreacha, Obj, Value } from "./values";

export function assertNumber(x: Value): number {
    if (Checks.isNumber(x)) {
        return x;
    }
    throw new RuntimeError(`Ní uimhir é ${goLitreacha(x)}`);
}

export function assertBool(x: Value): boolean {
    if (Checks.isBool(x)) {
        return x;
    }
    throw new RuntimeError(`Ní uimhir é ${goLitreacha(x)}`);
}

export function assertLiosta(x: Value): Value[] {
    if (Checks.isLiosta(x)) {
        return x;
    }
    throw new RuntimeError(`Ní liosta é ${goLitreacha(x)}`);
}

export function assertLitreacha(x: Value): string {
    if (Checks.isLitreacha(x)) {
        return x;
    }
    throw new RuntimeError(`Ní litreacha é ${goLitreacha(x)}`);
}

export function assertCallable(x: Value): Callable {
    if (Checks.isCallable(x)) {
        return x;
    }
    throw new RuntimeError(`Níl gníomh é ${goLitreacha(x)}`);
}

export function assertObj(x: Value): Obj {
    if (Checks.isObj(x)) {
        return x;
    }
    throw new RuntimeError(`Ní rud é ${goLitreacha(x)}`);
}

export function assertComparable(a: Value): Comparable {
    if (Checks.isComparable(a)) {
        return a;
    }
    throw new RuntimeError(`Ní féidir leat comparáid a dheanamh le ${goLitreacha(a)}`);
}

export function assertIndexable(a: Value): ArrayLike<Value> {
    if (Checks.isLiosta(a) || Checks.isLitreacha(a)) {
        return a;
    }
    throw new RuntimeError(`Ní liosta nó litreacha é ${goLitreacha(a)}`);
}
