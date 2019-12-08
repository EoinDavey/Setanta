export type Value = number | boolean | Callable | null;

export function isTrue(v : Value) {
    return v !== 0 && v !== false;
}

export function isCallable(v : Value) : v is Callable {
    return !(v === null || typeof v === "number" || typeof v === "boolean");
}

export function isNumber(v : Value) : v is number {
    return typeof v === "number";
}

export function isBool(v : Value) : v is boolean {
    return typeof v === "boolean";
}

export interface Callable {
    arity : () => number;
    call: (args : Value[]) => Value;
}
