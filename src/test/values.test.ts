import { Value, goTéacs } from "../../src/values";

test("test goTéacs", () => {
    interface TC { v: Value; exp: string; }
    const cases: TC[] = [
        { v: 123, exp: "123" },
        { v: 0, exp: "0" },
        { v: 0.2, exp: "0.2" },
        { v: "test", exp: "test" },
        { v: "", exp: "" },
        { v: "gníomhaíochtaí", exp: "gníomhaíochtaí" },
        { v: true, exp: "fíor" },
        { v: false, exp: "bréag" },
        { v: [1, 2, 3], exp: "[1, 2, 3]" },
        { v: [], exp: "[]" },
        { v: [[1, true], ["bréag", []]], exp: "[[1, fíor], [bréag, []]]" },
        {
            exp: "< gníomh id >",
            v: { ainm: "id", arity: () => 0, call: () => Promise.resolve(null) },
        },
        {
            exp: "< gníomh  >",
            v: { ainm: "", arity: () => 0, call: () => Promise.resolve(null) },
        },
        {
            exp: "< gníomh gníomh >",
            v: { ainm: "gníomh", arity: () => 0, call: () => Promise.resolve(null) },
        },
    ];
    for (const c of cases) {
        expect(goTéacs(c.v)).toEqual(c.exp);
    }
});
