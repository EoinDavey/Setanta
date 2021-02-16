import { athchuir, unescapeChars } from "../../src/teacs";
describe("test unescapeChars", () => {
    interface TC { inp: string; exp: string; }
    const cases: TC[] = [
        { inp: "", exp: "" },
        { inp: "abc", exp: "abc" },
        { inp: String.raw`abc\n`, exp: "abc\n" },
        { inp: String.raw`abc\tabc`, exp: "abc\tabc" },
        { inp: String.raw`\\\\`, exp: "\\\\" },
        { inp: String.raw`\'abc\'`, exp: "'abc'" },
    ];
    for (const c of cases) {
        test(`unescapeChars(${c.inp}) = "${c.exp}"?`, () =>
            expect(unescapeChars(c.inp)).toEqual(c.exp));
    }
});

describe("test athchuir", () => {
    interface TC { inp: string; rep: string; val: string; exp: string; }
    const cases: TC[] = [
        { inp: "aaaa", rep: "b", val: "c", exp: "aaaa" },
        { inp: "aaaa", rep: "a", val: "c", exp: "cccc" },
        { inp: "abab", rep: "ab", val: "", exp: "" },
        { inp: "", rep: "a", val: "b", exp: "" },
    ];
    for (const c of cases) {
        test(`athchuir(${c.inp}, ${c.rep}, ${c.val}) = "${c.exp}"?`, () =>
            expect(athchuir(c.inp, c.rep, c.val)).toEqual(c.exp));
    }
});
