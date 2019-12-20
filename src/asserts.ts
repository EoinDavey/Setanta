import * as Checks from "./checks";
import { RuntimeError } from "./error";
import { Callable, Comparable, Obj, Value } from "./values";

export function assertNumber(x: Value): number {
    if (Checks.isNumber(x)) {
        return x;
    }
    throw new RuntimeError(`${x} is not number`);
}

export function assertLiosta(x: Value): Value[] {
    if (Checks.isLiosta(x)) {
        return x;
    }
    throw new RuntimeError(`${x} is not a list`);
}

export function assertLitreacha(x: Value): string {
    if (Checks.isLitreacha(x)) {
        return x;
    }
    throw new RuntimeError(`${x} is not a string`);
}

export function assertCallable(x: Value): Callable {
    if (Checks.isCallable(x)) {
        return x;
    }
    throw new RuntimeError(`${x} is not callable`);
}

export function assertObj(x: Value): Obj {
    if (Checks.isObj(x)) {
        return x;
    }
    throw new RuntimeError(`${x} is not callable`);
}

export function assertComparable(a: Value): Comparable {
    if (Checks.isComparable(a)) {
        return a;
    }
    throw new RuntimeError(`${a} is not comparable`);
}

export function assertIndexable(a: Value): ArrayLike<Value> {
    if (Checks.isLiosta(a) || Checks.isLitreacha(a)) {
        return a;
    }
    throw new RuntimeError(`${a} is not indexable`);
}
