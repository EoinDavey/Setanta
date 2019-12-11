import { Interpreter } from '../../src/i10r';
import { Value } from '../../src/values';
import { Parser } from '../../src/parser';
import { Environment } from '../../src/env';

test('test expressions', () => {
    interface tc { inp: string, exp: Value, env?: Environment}
    const cases : tc[] = [
        {inp : '12 + 3*5', exp : 27},
        {inp : '12 + 3*5 == 27', exp : true},
        {inp : '12-12-12', exp : -12},
        {inp : '12*2/3', exp : 8},
        {inp : '1 <= 0', exp : false},
        {inp : '1 >= 0', exp : true},
        {inp : 'big > small', exp : true, env: Environment.from([["big", 100], ["small", 1]])},
        {inp : 'x*x + y*y - z*z', exp : 0, env: Environment.from([["x", 3], ["y", 4], ["z", 5]])},
        {inp : 'fíor == fíor', exp: true},
        {inp : 'fíor == breag', exp: false},
        {inp : 'fíor & fíor != breag', exp: true},
        {inp : 'fíor | breag == 5 >= 5', exp: true},
        {inp : 'neamhní == neamhní', exp: true},
        {inp : 'neamhní == fíor', exp: false},
        {inp : 'neamhní == breag', exp: false},
        {inp : 'neamhní == 0', exp: false},
        {inp : 'neamhní == 1', exp: false},
    ];
    for(let c of cases){
        const i = new Interpreter();
        if(c.env)
            i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = i.evalExpr(res!);
        expect(got).toEqual(c.exp);
    }
});

test('test assign', () => {
    interface tc { inp: string, exp: Value, env?: Environment};
    const cases : tc[] = [
        {
            inp : `res := 12`,
            exp : 12,
        },
        {
            inp : `x := 6
            y := 2*x
            y = y+1
            res := y*y`,
            exp : 169,
        },
        {
            inp : `máx := 6
            fíory := 2*máx
            fíory = fíory+1
            res := fíory*fíory`,
            exp : 169,
        },
        {
            inp : `res := x
            10*10-40/3
            res = res*res + res + 3`,
            exp : 113,
            env: Environment.from([['x', 10]])
        },
    ];
    for(let c of cases){
        const i = new Interpreter();
        if(c.env)
            i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.parse();
        expect(res.err).toBeNull();
        expect(res.ast).not.toBeNull();
        i.interpret(res.ast!);
        expect(i.env.get('res')).toEqual(c.exp);
    }
});

test('test if stmt', () => {
    interface tc { inp: string, exp: Value, env?: Environment};
    const cases : tc[] = [
        {
            inp : `
            res := 6
            má res > 5
                res = res+2`,
            exp : 8,
        },
        {
            inp : `má 5 == 5 { 5 }
            res := 6
            má res > 5
                res = res+2`,
            exp : 8,
        },
        {
            inp : `
            x := 6
            res := 10
            má x < 5
                x = x + 2
            nó {
                res := 100
            }`,
            exp : 10,
        },
        {
            inp : `
            res := 6
            má res < 5 {
                res = res + 2
            } nó {
                res = 100
            }`,
            exp : 100,
        },
    ];
    for(let c of cases){
        const i = new Interpreter();
        if(c.env)
            i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.parse();
        if(res.err)
            console.log(c);
        expect(res.err).toBeNull();
        expect(res.ast).not.toBeNull();
        i.interpret(res.ast!);
        expect(i.env.get('res')).toEqual(c.exp);
    }
});

test('test nuair a loops', () => {
    interface tc { inp: string, exp: Value, env?: Environment};
    const cases : tc[] = [
        {
            inp : `
            res := 0
            nuair a res < 10 
                res = res + 1`,
            exp : 10,
        },
        {
            inp : `
            cnt := 0
            i := 0
            nuair a i < 10 {
                j := 0
                nuair a j < 10 {
                    j = j + 1
                    cnt = cnt + 1
                }
                i = i + 1
            }
            res := cnt`,
            exp : 100,
        },
        {
            inp: `
            res := 0
            nuair a fíor {
                res = res + 1
                má res == 10
                    bris
            }`,
            exp : 10,
        },
        {
            inp: `
            res := 0
            i := 0
            nuair a i < 10 {
                i = i + 1
                má i % 2 == 0 {
                    chun cinn
                }
                res = res + i
            }`,
            exp : 25,
        },
    ];
    for(let c of cases){
        const i = new Interpreter();
        if(c.env)
            i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.parse();
        expect(res.err).toBeNull();
        expect(res.ast).not.toBeNull();
        i.interpret(res.ast!);
        expect(i.env.get('res')).toEqual(c.exp);
    }
});

test('test le idir loops', () => {
    interface tc { inp: string, exp: Value, env?: Environment};
    const cases : tc[] = [
        {
            inp : `
            res := 0
            le i idir (0, 10)
                res = res + 1`,
            exp : 10,
        },
        {
            inp : `
            res := 0
            le i idir (0,10)
                le i idir ( 0 , 10 )
                    res = res + i `,
            exp : 450,
        },
        {   // Comhair ná uimhreacha príomha
            inp : `
            res := 1
            le i idir(3, 100) {
                príomha := fíor
                le j idir(2, i) {
                    má j * j > i
                        bris
                    má i % j == 0 {
                        príomha = breag
                        bris
                    }
                }
                má príomha
                    res = res + 1
            }`,
            exp : 25,
        },
        {
            inp : `
            res := 0
            le x idir (0, 20) {
                le i idir (0, x) {
                    má i % 3 == 0
                        chun cinn
                    res = res + i
                }
            }`,
            exp : 762,
        },
    ];
    for(let c of cases){
        const i = new Interpreter();
        if(c.env)
            i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.parse();
        expect(res.err).toBeNull();
        expect(res.ast).not.toBeNull();
        i.interpret(res.ast!);
        expect(i.env.get('res')).toEqual(c.exp);
    }
});

test('test function calls', () => {
    interface tc { inp: string, exp: Value, env?: Environment};
    const cases : tc[] = [
        {
            inp : `res := sum(12*3, 4+2)`,
            exp : 42,
            env : Environment.from([
                ['sum', {
                    arity: () => 2,
                    call: (args) => {
                        return (args[0] as number)+(args[1] as number);
                    }
                }],
            ])
        },
        {
            inp : `res := sum(square(3), square(4)) - square(5)`,
            exp : 0,
            env : Environment.from([
                ['sum', {
                    arity: () => 2,
                    call: (args) => {
                        return (args[0] as number)+(args[1] as number);
                    }
                }],
                ['square', {
                    arity: () => 1,
                    call: (args) => {
                        return (args[0] as number)*(args[0] as number);
                    }
                }],
            ])
        },
    ];
    for(let c of cases){
        const i = new Interpreter();
        if(c.env)
            i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.parse();
        expect(res.err).toBeNull();
        expect(res.ast).not.toBeNull();
        i.interpret(res.ast!);
        expect(i.env.get('res')).toEqual(c.exp);
    }
});

test('test function definitions', () => {
    interface tc { inp: string, exp: Value, env?: Environment};
    const cases : tc[] = [
        {
            inp : `
            res := 0
            gníomh addToRes(x) {
                res = res + x
            }
            le i idir (1, 10)
                addToRes(i)
            `,
            exp : 45,
        },
        {
            inp : `
            res := 0
            gníomh recurse(acc, d) {
                má d == 0 {
                    res = acc
                } nó {
                    recurse(acc + 1, d-1)
                }
            }
            recurse(0, 10)
            `,
            exp : 10,
        },
        {
            inp : `
            res := 0
            gníomh recurse(d) {
                val := d
                má d != 0 {
                    recurse(d-1)
                }
                res = res + val
            }
            recurse(10)
            `,
            exp : 55,
        },
    ];
    for(let c of cases){
        const i = new Interpreter();
        if(c.env)
            i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.parse();
        expect(res.err).toBeNull();
        expect(res.ast).not.toBeNull();
        i.interpret(res.ast!);
        expect(i.env.get('res')).toEqual(c.exp);
    }
});
