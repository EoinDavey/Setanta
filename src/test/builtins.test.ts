import { Environment } from "../../src/env";
import { Parser } from "../../src/gen_parser";
import { Interpreter } from "../../src/i10r";
import { Value } from "../../src/values";

test("test fad", async () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp: "fad([])", exp : 0},
        { inp: "fad([1])", exp : 1},
        { inp: "fad([1,2,3,4,5])", exp : 5},
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        expect(got).toEqual(c.exp);
    }
});

test("test roinn", async () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp: "roinn('a b c', ' ')", exp : ["a", "b", "c"]},
        { inp: "roinn('a,b,c', ' ')", exp : ["a,b,c"]},
        { inp: "roinn('a,b,c' ,',')", exp : ["a", "b", "c"]},
        { inp: "roinn('a', '')", exp : ["a"]},
        { inp: "roinn('', ' ')", exp : [""]},
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        expect(got).toEqual(c.exp);
    }
});

test("test cuid", async () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp: "cuid('abc', 0, 2)", exp : "ab"},
        { inp: "cuid([1,2,3], 0, 2)", exp : [1, 2]},
        { inp: "cuid([1,2,3], 0, 0)", exp : []},
        { inp: "cuid([1,2,3], 0, -1)", exp : [1, 2]},
        { inp: "cuid([1,2,3], 0, 3)", exp : [1, 2, 3]},
        { inp: "cuid([1,2,3], 0, 4)", exp : [1, 2, 3]},
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        expect(got).toEqual(c.exp);
    }
});

test("test go_uimh", async () => {
    interface TC { inp: string; exp: number; }
    const cases: TC[] = [
        { inp : "go_uimh('123')", exp : 123 },
        { inp : "go_uimh('123.456')", exp : 123.456 },
        { inp : "go_uimh(fíor)", exp : 1 },
        { inp : "go_uimh(breag)", exp : 0 },
        { inp : "go_uimh(1234)", exp : 1234 },
        { inp : "go_uimh('míuimh')", exp : NaN },
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        expect(got).toEqual(c.exp);
    }
});

test("test go_lit", async () => {
    interface TC { inp: string; exp: string; }
    const cases: TC[] = [
        { inp : "go_lit(123)", exp : "123" },
        { inp : "go_lit(fíor)", exp : "fíor" },
        { inp : "go_lit(breag)", exp : "bréag" },
        { inp : "go_lit('1234')", exp : "1234" },
        { inp : "go_lit(go_lit)", exp : "< gníomh go_lit >" },
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        expect(got).toEqual(c.exp);
    }
});

test("uas/íos test", async () => {
    interface TC { inp: string; exp: number; }
    const cases: TC[] = [
        { inp : "uas(3, 4)", exp : 4 },
        { inp : "íos(3, 4)", exp : 3 },
        { inp : "ios(3, 4)", exp : 3 },
        { inp : "uas(3, 3)", exp : 3 },
        { inp : "íos(-3, 3)", exp : -3 },
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        expect(got).toEqual(c.exp);
    }
});

test("test mata", async () => {
    interface TC { inp: string; exp: Value; }
    const cases: TC[] = [
        { inp : "cearn@mata(5)", exp : 25 },
        { inp : "pi@mata", exp : Math.PI },
        { inp : "e@mata", exp : Math.E },
        { inp : "cearn@mata(pi@mata)", exp : Math.PI * Math.PI },
        { inp : "fréamh@mata(4)", exp : 2 },
        { inp : "rand@mata() < 1", exp: true},
        { inp : "rand@mata() > 0", exp: true},
        { inp : "randUimh@mata(100, 200) >= 100", exp: true},
        { inp : "randUimh@mata(100, 200) < 200", exp: true},
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        expect(got).toEqual(c.exp);
    }
});
