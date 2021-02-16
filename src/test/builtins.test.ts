import { isNumber } from "../../src/checks";
import { Parser, parse } from "../../src/gen_parser";
import { Interpreter } from "../../src/i10r";
import { Value } from "../../src/values";
import { resolveASTNode } from "../../src/bind";
import { allFadaCombos } from "../../src/builtins";

describe("test fad", () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp: "fad([])", exp: 0},
        { inp: "fad([1])", exp: 1},
        { inp: "fad([1,2,3,4,5])", exp: 5},
        { inp: "fad('')", exp: 0},
        { inp: "fad('hey')", exp: 3},
        { inp: "fad([1,2,3,4,5])", exp: 5},
        { inp: "fad@[]", exp: 0},
        { inp: "fad@[1]", exp: 1},
        { inp: "fad@[1,2,3,4,5]", exp: 5},
        { inp: "fad@''", exp: 0},
        { inp: "fad@'hey'", exp: 3},
    ];
    for (const c of cases) {
        test(`inp: "${c.inp}"`, async () => {
            const i = new Interpreter();
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const got = await resolveASTNode(res!).evalfn(i.global);
            expect(got).toEqual(c.exp);
        });
    }
});

describe("test téacs fns", () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp: "roinn@'a b c'(' ')", exp: ["a", "b", "c"]},
        { inp: "roinn@'a,b,c'(' ')", exp: ["a,b,c"]},
        { inp: "roinn@'a,b,c'(',')", exp: ["a", "b", "c"]},
        { inp: "roinn@'a'('')", exp: ["a"]},
        { inp: "roinn@''(' ')", exp: [""]},
        { inp: "cuid@'abc'(0, 2)", exp: "ab"},
        { inp: "cuid@'abc'(1, 2)", exp: "b"},
        { inp: "cuid@'abc'(0, 3)", exp: "abc"},
        { inp: "athchuir@'test string'('s', 'e')", exp: "teet etring" },
        {
            inp: "go_liosta@'test string'()",
            exp: ["t", "e", "s", "t", " ", "s", "t", "r", "i", "n", "g"],
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const got = await resolveASTNode(res!).evalfn(i.global);
            expect(got).toEqual(c.exp);
        });
    }
});

describe("test liosta fns", () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp: "cuid@[1,2,3](0, 2)", exp: [1, 2]},
        { inp: "cuid@[1,2,3](0, 0)", exp: []},
        { inp: "cuid@[1,2,3](0, -1)", exp: [1, 2]},
        { inp: "cuid@[1,2,3](0, 3)", exp: [1, 2, 3]},
        { inp: "cuid@[1,2,3](0, 4)", exp: [1, 2, 3]},
        { inp: "sortail@[3,1,2]()", exp: [1, 2, 3]},
        { inp: "sórtáil@[2,3,1]()", exp: [1, 2, 3]},
        { inp: "nasc@[1,2,3,4](', ')", exp: "1, 2, 3, 4"},
        { inp: "nasc@[neamhní, 'hey', 3, fior]('')", exp: "neamhníhey3fíor"},
        { inp: "aimsigh@[0, 1, 2](1)", exp: 1},
        { inp: "aimsigh@[1, 1, 2](1)", exp: 0},
        { inp: "aimsigh@[0, 1, 2](3)", exp: -1},
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const got = await resolveASTNode(res!).evalfn(i.global);
            expect(got).toEqual(c.exp);
        });
    }
});

test("test cóip liosta", async () => {
    const prog = `
    ls := [1, 2, 3]
    cóip_ls := cóip@ls()
    cóip_ls[0] += 1
    res := ls[0] + cóip_ls[0]`;
    const i = new Interpreter();
    const res = parse(prog);
    expect(res.ast).not.toBeNull();
    await i.interpret(res.ast!);
    expect(i.global.env.getGlobalValDirect("res")).toEqual(3);
});

test("test scrios liosta", async () => {
    const sm = 55;
    for (let i = 0; i < 10; ++i) {
        const prog = `
        ls := [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        scrios@ls(${i})
        res := 0
        le i idir (0, fad@ls)
            res += ls[i]`;
        const i10r = new Interpreter();
        const res = parse(prog);
        expect(res.ast).not.toBeNull();
        await i10r.interpret(res.ast!);
        expect(i10r.global.env.getGlobalValDirect("res")).toEqual(sm - (i + 1));
    }

    // Assert throws correct error
    const prog = `
    ls := []
    scrios@ls(0)`;
    const i10r = new Interpreter();
    const res = parse(prog);
    expect(res.ast).not.toBeNull();
    expect(i10r.interpret(res.ast!)).rejects.toThrow(`Ní innéacs den liosta é 0`);
});

test("test scrios_cúl liosta", async () => {
    const prog = `
    ls := [1, 2, 3, 4, 5]
    res := ""
    le i idir (0, fad@ls) {
        res += go_téacs(ls) + '\n'
        scrios_cúl@ls()
    }
    `;
    const i = new Interpreter();
    const res = parse(prog);
    expect(res.ast).not.toBeNull();
    await i.interpret(res.ast!);
    expect(i.global.env.getGlobalValDirect("res")).toEqual(`[1, 2, 3, 4, 5]
[1, 2, 3, 4]
[1, 2, 3]
[1, 2]
[1]
`);
});

test("test scrios_cúl liosta error", async () => {
    const prog = `
    ls := []
    scrios_cúl@ls()`;
    const i = new Interpreter();
    const res = parse(prog);
    expect(res.ast).not.toBeNull();
    expect(i.interpret(res.ast!)).rejects.toThrow(`Ní feidir cúl liosta folamh a scriosadh`);
});

describe("test go_uimh", () => {
    interface TC { inp: string; exp: number; }
    const cases: TC[] = [
        { inp: "go_uimh('123')", exp: 123 },
        { inp: "go_uimh('123.456')", exp: 123.456 },
        { inp: "go_uimh(fíor)", exp: 1 },
        { inp: "go_uimh(breag)", exp: 0 },
        { inp: "go_uimh(1234)", exp: 1234 },
        { inp: "go_uimh('míuimh')", exp: NaN },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const got = await resolveASTNode(res!).evalfn(i.global);
            expect(got).toEqual(c.exp);
        });
    }
});

describe("test go_téacs", () => {
    interface TC { inp: string; exp: string; }
    const cases: TC[] = [
        { inp: "go_téacs(123)", exp: "123" },
        { inp: "go_teacs(fíor)", exp: "fíor" },
        { inp: "go_téacs(breag)", exp: "bréag" },
        { inp: "go_téacs('1234')", exp: "1234" },
        { inp: "go_teacs(go_téacs)", exp: "< gníomh go_téacs >" },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const got = await resolveASTNode(res!).evalfn(i.global);
            expect(got).toEqual(c.exp);
        });
    }
});

describe("uas/íos test", () => {
    interface TC { inp: string; exp: number | string; }
    const cases: TC[] = [
        { inp: "uas(3, 4)", exp: 4 },
        { inp: "íos(3, 4)", exp: 3 },
        { inp: "ios(3, 4)", exp: 3 },
        { inp: "uas(3, 3)", exp: 3 },
        { inp: "íos(-3, 3)", exp: -3 },
        { inp: "íos('a', 'b')", exp: "a" },
        { inp: "íos('ab', 'b')", exp: "ab" },
        { inp: "uas('b', 'a')", exp: "b" },
        { inp: "uas('aa', 'a')", exp: "aa" },
        { inp: "íos('aaaab', 'aaaac')", exp: "aaaab" },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const got = await resolveASTNode(res!).evalfn(i.global);
            expect(got).toEqual(c.exp);
        });
    }
});

describe("test mata", () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp: "cearn@mata(5)", exp: 25 },
        { inp: "pi@mata", exp: Math.PI },
        { inp: "e@mata", exp: Math.E },
        { inp: "cearn@mata(pi@mata)", exp: Math.PI * Math.PI },
        { inp: "fréamh@mata(4)", exp: 2 },
        { inp: "rand@mata() < 1", exp: true },
        { inp: "rand@mata() > 0", exp: true },
        { inp: "randUimh@mata(100, 200) >= 100", exp: true },
        { inp: "randUimh@mata(100, 200) < 200", exp: true },
        { inp: "slánuimh_rand@mata(10, 20) >= 10", exp: true },
        { inp: "slánuimh_rand@mata(10, 20) <= 20", exp: true },
        { inp: "cos@mata(0)", exp: 1 },
        { inp: "cos@mata(pi@mata)", exp: -1 },
        { inp: "cos@mata(2*pi@mata)", exp: 1 },
        { inp: "sin@mata(0)", exp: 0 },
        { inp: "sin@mata(pi@mata/2)", exp: 1 },
        { inp: "sin@mata(pi@mata)", exp: 0 },
        { inp: "sin@mata(2*pi@mata)", exp: 0 },
        { inp: "tan@mata(2*pi@mata)", exp: Math.tan(2 * Math.PI) },
        { inp: "tan@mata(pi@mata / 4)", exp: 1 },
        { inp: "logb@mata(4, 2)", exp: 2 },
        { inp: "logb@mata(125, 5)", exp: 3 },
        { inp: "log@mata(1)", exp: 0 },
        { inp: "log@mata(2)", exp: Math.log(2) },
        { inp: "asin@mata(0)", exp: 0},
        { inp: "acos@mata(1)", exp: 0},
        { inp: "atan@mata(1)", exp: Math.PI / 4},
        { inp: "dearbh@mata(0)", exp: 0 },
        { inp: "dearbh@mata(-0)", exp: 0 },
        { inp: "dearbh@mata(-1)", exp: 1 },
        { inp: "dearbh@mata(1)", exp: 1 },
        { inp: "cmhcht@mata(2, 2)", exp: 4 },
        { inp: "cmhcht@mata(2, 4)", exp: 16 },
        { inp: "eas@mata(0)", exp: 1 },
        { inp: "eas@mata(1)", exp: Math.E },
        { inp: "eas@mata(2)", exp: Math.exp(2) },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const got = await resolveASTNode(res!).evalfn(i.global);
            if (isNumber(got)) {
                expect(got).toBeCloseTo(c.exp as number);
            } else {
                expect(got).toEqual(c.exp);
            }
        });
    }
});

test("test codladh", async () => {
    const res = parse(`codladh(1000)`);
    expect(res.errs).toEqual([]);
    expect(res.ast).not.toBeNull();
    const i = new Interpreter();
    const start = Date.now();
    let nonBlocked = false;
    setTimeout(() => { nonBlocked = true; });
    await i.interpret(res.ast!);
    const end = Date.now();
    expect(nonBlocked).toEqual(true);
    expect(end - start).toBeGreaterThan(500);
});

test("test fan", async () => {
    const res = parse(`fan()`);
    expect(res.errs).toEqual([]);
    expect(res.ast).not.toBeNull();
    const i = new Interpreter();
    const start = Date.now();
    setTimeout(() => i.stop(), 1000);
    await i.interpret(res.ast!);
    const end = Date.now();
    expect(end - start).toBeGreaterThan(500);
});

describe("test allFadaCombos", () => {
    const cases: {inp: string, exp: string[]}[] = [
        { inp: "á", exp: ["a", "á"] },
        { inp: "a", exp: ["a"] },
        {
            inp: "Uachtarán na hÉireann",
            exp: [
                "Uachtarán na hÉireann",
                "Uachtaran na hÉireann",
                "Uachtarán na hEireann",
                "Uachtaran na hEireann",
            ],
        },
        {
            inp: "Uachtarán na hÉireann",
            exp: [
                "Uachtarán na hÉireann",
                "Uachtaran na hÉireann",
                "Uachtarán na hEireann",
                "Uachtaran na hEireann",
            ],
        },
        {
            inp: "píosa_ciorcal_lán",
            exp: [
                "píosa_ciorcal_lán",
                "píosa_ciorcal_lan",
                "piosa_ciorcal_lán",
                "piosa_ciorcal_lan",
            ],
        },
        {
            inp: "níos mó",
            exp: [
                "níos mó",
                "nios mó",
                "níos mo",
                "nios mo",
            ],
        },
    ];
    for(const tc of cases) {
        test(`inp: ${tc.inp}`, () => {
            const res = allFadaCombos(tc.inp);
            expect(res.sort()).toEqual(tc.exp.sort());
        });
    }
});
