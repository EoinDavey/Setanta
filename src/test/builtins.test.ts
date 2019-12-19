import { Value } from '../../src/values';
import { Interpreter } from '../../src/i10r';
import { Parser } from '../../src/gen_parser';
import { Environment } from '../../src/env';

test('test fad', async () => {
    interface tc { inp: string, exp: Value}
    const cases : tc[] = [
        { inp: 'fad([])', exp : 0},
        { inp: 'fad([1])', exp : 1},
        { inp: 'fad([1,2,3,4,5])', exp : 5}
    ];
    for(let c of cases){
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await i.evalExpr(res!, i.global);
        expect(got).toEqual(c.exp);
    }
});

test('test roinn', async () => {
    interface tc { inp: string, exp: Value}
    const cases : tc[] = [
        { inp: "roinn('a b c', ' ')", exp : ['a','b','c']},
        { inp: "roinn('a,b,c', ' ')", exp : ['a,b,c']},
        { inp: "roinn('a,b,c' ,',')", exp : ['a','b','c']},
        { inp: "roinn('a', '')", exp : ['a']},
        { inp: "roinn('', ' ')", exp : ['']},
    ];
    for(let c of cases){
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await i.evalExpr(res!, i.global);
        expect(got).toEqual(c.exp);
    }
});

test('test cuid', async () => {
    interface tc { inp: string, exp: Value}
    const cases : tc[] = [
        { inp: "cuid('abc', 0, 2)", exp : 'ab'},
        { inp: "cuid([1,2,3], 0, 2)", exp : [1, 2]},
        { inp: "cuid([1,2,3], 0, 0)", exp : []},
        { inp: "cuid([1,2,3], 0, -1)", exp : [1, 2]},
        { inp: "cuid([1,2,3], 0, 3)", exp : [1, 2, 3]},
        { inp: "cuid([1,2,3], 0, 4)", exp : [1, 2, 3]},
    ];
    for(let c of cases){
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await i.evalExpr(res!, i.global);
        expect(got).toEqual(c.exp);
    }
});

test('test go_uimh', async () => {
    interface tc { inp: string, exp: number}
    const cases : tc[] = [
        { inp : "go_uimh('123')", exp : 123 },
        { inp : "go_uimh('123.456')", exp : 123.456 },
        { inp : "go_uimh(fíor)", exp : 1 },
        { inp : "go_uimh(breag)", exp : 0 },
        { inp : "go_uimh(1234)", exp : 1234 },
        { inp : "go_uimh('míuimh')", exp : NaN },
    ];
    for(let c of cases){
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await i.evalExpr(res!, i.global);
        expect(got).toEqual(c.exp);
    }
});

test('test go_lit', async () => {
    interface tc { inp: string, exp: string}
    const cases : tc[] = [
        { inp : "go_lit(123)", exp : '123' },
        { inp : "go_lit(fíor)", exp : 'fíor' },
        { inp : "go_lit(breag)", exp : 'breag' },
        { inp : "go_lit('1234')", exp : '1234' },
        { inp : "go_lit(go_lit)", exp : '< gníomh go_lit >' },
    ];
    for(let c of cases){
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await i.evalExpr(res!, i.global);
        expect(got).toEqual(c.exp);
    }
});

test('test mata', async () => {
    interface tc { inp: string, exp: Value}
    const cases : tc[] = [
        { inp : "cearn@mata(5)", exp : 25 },
        { inp : "pi@mata", exp : Math.PI },
        { inp : "e@mata", exp : Math.E },
        { inp : "cearn@mata(pi@mata)", exp : Math.PI*Math.PI }
    ];
    for(let c of cases){
        const i = new Interpreter();
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = await i.evalExpr(res!, i.global);
        expect(got).toEqual(c.exp);
    }
});
