import { Value } from "./values";

export function cat(a: Value[], b: Value[]): Value[] {
    return a.concat(b);
}

export function repeat(ls: Value[], uimh: number): Value[] {
    const toradh = [];
    for (let i = 0; i < uimh; ++i) {
        toradh.push(...ls);
    }
    return toradh;
}
