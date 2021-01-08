import { Value } from "./values";

// This library contains utility functions for support Setanta lists.

export function cat(a: Value[], b: Value[]): Value[] {
    return a.concat(b);
}

// repeat creates a new list by repeating one list a number of times.
export function repeat(ls: Value[], uimh: number): Value[] {
    const toradh = [];
    for (let i = 0; i < uimh; ++i)
        toradh.push(...ls);
    return toradh;
}
