import { isNumber } from "../../src/checks";
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

test("test go_téacs", async () => {
    interface TC { inp: string; exp: string; }
    const cases: TC[] = [
        { inp : "go_téacs(123)", exp : "123" },
        { inp : "go_teacs(fíor)", exp : "fíor" },
        { inp : "go_téacs(breag)", exp : "bréag" },
        { inp : "go_téacs('1234')", exp : "1234" },
        { inp : "go_teacs(go_téacs)", exp : "< gníomh go_téacs >" },
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
        { inp : "rand@mata() < 1", exp: true },
        { inp : "rand@mata() > 0", exp: true },
        { inp : "randUimh@mata(100, 200) >= 100", exp: true },
        { inp : "randUimh@mata(100, 200) < 200", exp: true },
        { inp : "cos@mata(0)", exp: 1 },
        { inp : "cos@mata(pi@mata)", exp: -1 },
        { inp : "cos@mata(2*pi@mata)", exp: 1 },
        { inp : "sin@mata(0)", exp: 0 },
        { inp : "sin@mata(pi@mata/2)", exp: 1 },
        { inp : "sin@mata(pi@mata)", exp: 0 },
        { inp : "sin@mata(2*pi@mata)", exp: 0 },
        { inp : "logb@mata(4, 2)", exp: 2 },
        { inp : "logb@mata(125, 5)", exp: 3 },
        { inp : "log@mata(1)", exp: 0 },
        { inp : "log@mata(2)", exp: Math.log(2) },
    ];
    for (const c of cases) {
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await res!.evalfn(i.global);
        if (isNumber(got)) {
            expect(got).toBeCloseTo(c.exp as number);
        } else {
            expect(got).toEqual(c.exp);
        }
    }
});
