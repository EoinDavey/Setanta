import { Interpreter } from '../../src/i10r';
import { Value } from '../../src/values';
import { Parser } from '../../src/parser';
import { Environment } from '../../src/env';

test('test expressions', () => {
    interface tc { inp: string, exp: Value, env: Environment}
    const cases : tc[] = [
        {inp : '12 + 3*5', exp : 27, env: new Environment()},
        {inp : '12 + 3*5 == 27', exp : true, env: new Environment()},
        {inp : '12-12-12', exp : -12, env: new Environment()},
        {inp : '12*2/3', exp : 8, env: new Environment()},
        {inp : '1 <= 0', exp : false, env: new Environment()},
        {inp : '1 >= 0', exp : true, env: new Environment()},
        {inp : 'big > small', exp : true, env: Environment.from([["big", 100], ["small", 1]])},
        {inp : 'x*x + y*y - z*z', exp : 0, env: Environment.from([["x", 3], ["y", 4], ["z", 5]])}
    ];
    for(let c of cases){
        const i = new Interpreter();
        i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.matchExpr(0);
        expect(res).not.toBeNull();
        const got = i.evalExpr(res!);
        expect(got).toEqual(c.exp);
    }
});

test('test assign', () => {
    interface tc { inp: string, exp: Value, env: Environment};
    const cases : tc[] = [
        {
            inp : `res := 12`,
            exp : 12,
            env: new Environment()
        },
        {
            inp : `x := 6
            y := 2*x
            y = y+1
            res := y*y`,
            exp : 169,
            env: new Environment()
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
        i.env = c.env;
        const p = new Parser(c.inp);
        const res = p.matchProgram(0);
        expect(res).not.toBeNull();
        i.interpret(res!);
        expect(i.env.get('res')).toEqual(c.exp);
    }
});
