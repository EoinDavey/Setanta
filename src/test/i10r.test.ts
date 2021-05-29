import { CreatlachImpl } from "../../src/creatlach";
import { Environment } from "../../src/env";
import { Parser, parse } from "../../src/gen_parser";
import { GníomhWrap } from "../../src/gniomh";
import { Interpreter } from "../../src/i10r";
import { Rud } from "../../src/rud";
import { Value } from "../../src/values";
import { resolveASTNode } from "../../src/bind";

import * as Asserts from "../../src/asserts";
import * as Checks from "../../src/checks";

describe("test isEqual", () => {
    interface TC { a: Value; b: Value; eq: boolean; }
    const cases: TC[] = [
        {a: 3, b: 3, eq: true},
        {a: null, b: 0, eq: false},
        {a: null, b: false, eq: false},
        {a: null, b: null, eq: true},
        {a: false, b: true, eq: false},
        {a: false, b: false, eq: true},
        {a: true, b: true, eq: true},
        {a: [3, false, null], b: [3, false, null], eq: true},
        {a: [[], [1, 2, 3]], b: [[], [1, 2, 3]], eq: true},
        {a: [[], []], b: [[]], eq: false},
    ];
    for (let i = 0; i < cases.length; ++i) {
        const c = cases[i];
        test(`test ${i}`, () =>
            expect(Checks.isEqual(c.a, c.b)).toEqual(c.eq));
    }
});

describe("test expressions", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {inp: "42", exp: 42},
        {inp: "12345678910", exp: 12345678910},
        {inp: "56.0", exp: 56},
        {inp: "42.5", exp: 42.5},
        {inp: "12345.54321", exp: 12345.54321},
        {inp: "12 + 3*5", exp: 27},
        {inp: "12 + 3*5 == 27", exp: true},
        {inp: "12-12-12", exp: -12},
        {inp: "12*2/3", exp: 8},
        {inp: "12 // 4", exp: 3},
        {inp: "12 // 5", exp: 2},
        {inp: "12 // 1", exp: 12},
        {inp: "12 // 12", exp: 1},
        {inp: "1 <= 0", exp: false},
        {inp: "1 >= 0", exp: true},
        {inp: "(1)", exp: 1},
        {inp: "( 1 )", exp: 1},
        {inp: "big > small", exp: true, env: Environment.from([["big", 100], ["small", 1]])},
        {inp: "x*x + y*y - z*z", exp: 0, env: Environment.from([["x", 3], ["y", 4], ["z", 5]])},
        {inp: "fíor == fíor", exp: true},
        {inp: "fíor == breag", exp: false},
        {inp: "(fíor & fíor) != breag", exp: true},
        {inp: "(fior & bréag) == breag", exp: true},
        {inp: "(bréag & breag) == breag", exp: true},
        {inp: "(breag & fíor) == breag", exp: true},
        {inp: "fíor | breag == 5 >= 5", exp: true},
        {inp: "neamhní == neamhní", exp: true},
        {inp: "neamhní == fíor", exp: false},
        {inp: "neamhní == breag", exp: false},
        {inp: "neamhní == 0", exp: false},
        {inp: "neamhní == 1", exp: false},
        {inp: "[1,2,3] == [1,2,3]", exp: true},
        {inp: "[1,2,4] == [1,2,3]", exp: false},
        {inp: "[] == [1,2,3]", exp: false},
        {inp: "[1,2,3][0]", exp: 1},
        {inp: "[1,[1,2],3][1]", exp: [1, 2]},
        {inp: "-x", exp: -2, env: Environment.from([["x", 2]])},
        {inp: "-x[0]", exp: -2, env: Environment.from([["x", [2]]])},
        {inp: "!fíor", exp: false},
        {inp: "!breag", exp: true},
        {inp: "'abc'[0]", exp: "a"},
        {inp: "\"abc\"[0]", exp: "a"},
        {inp: "\"a\\\"bc\"[0]", exp: "a"},
        {inp: "[1,2,3][-1]", exp: 3},
        {inp: "[1,2,3][-2]", exp: 2},
        {inp: "[1,2,3][-3]", exp: 1},
        {inp: "-2 % 10", exp: 8},
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env)
                i.global.env = c.env;
            const p = new Parser(c.inp);
            const res = p.matchExpr(0);
            expect(res).not.toBeNull();
            const resolved = resolveASTNode(res!);
            const got = await resolved.evalfn(i.global);
            const quickGet = res!.qeval;
            expect(quickGet).not.toBeNull();
            expect(quickGet!(i.global)).toEqual(c.exp);
            expect(got).toEqual(c.exp);
        });
    }
});

describe("test assign", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 12,
            inp: `res := 12`,
        },
        {
            exp: 169,
            inp: `x := 6
            y := 2*x
            y = y+1
            res := y*y`,
        },
        {
            exp: 169,
            inp: `máx := 6
            fíory := 2*máx
            fíory = fíory+1
            res := fíory*fíory`,
        },
        {
            env: Environment.from([["x", 10]]),
            exp: 113,
            inp: `res := x
            10*10-40/3
            res = res*res + res + 3`,
        },
        {
            exp: 9,
            inp: `
            res := 10
            res += 2
            res *= 3
            res %= 5
            res /= 2
            res *= 4
            res += 12
            res -= 5
            `,
        },
        {
            exp: [0, 1, 2, 3],
            inp: `
            res := [0]
            res += [1,2,3]
            `,
        },
        {
            exp: [0, 0, 0, 0],
            inp: `
            res := [0]
            res *= 4
            `,
        },
        {
            exp: "heyho",
            inp: `
            res := 'hey'
            res += 'ho'
            `,
        },
        {
            exp: "hey, hey, hey, listen",
            inp: `
            res := 'hey, '
            res *= 3
            res += 'listen'
            `,
        },
        {
            exp: "Testing digits in IDs",
            inp: `
                x2 := 'Testing digits in IDs'
                y2_3_0 := x2
                res := y2_3_0
            `,
        },
        {
            exp: 2,
            inp: `
                res := 5
                res //= 2`,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test if stmt", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 8,
            inp: `
            res := 6
            má res > 5
                res = res+2`,
        },
        {
            exp: 8,
            inp: `má 5 == 5 { 5 }
            res := 6
            má res > 5
                res = res+2`,
        },
        {
            exp: 10,
            inp: `
            x := 6
            res := 10
            má x < 5
                x = x + 2
            nó {
                res := 100
            }`,
        },
        {
            exp: 100,
            inp: `
            res := 6
            má res < 5 {
                res = res + 2
            } nó {
                res = 100
            }`,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test nuair-a loops", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 10,
            inp: `
            res := 0
            nuair-a res < 10
                res = res + 1`,
        },
        {
            exp: 100,
            inp: `
            cnt := 0
            i := 0
            nuair-a i < 10 {
                j := 0
                nuair-a j < 10 {
                    j = j + 1
                    cnt = cnt + 1
                }
                i = i + 1
            }
            res := cnt`,
        },
        {
            exp: 10,
            inp: `
            res := 0
            nuair-a fíor {
                res = res + 1
                má res == 10
                    bris
            }`,
        },
        {
            exp: 25,
            inp: `
            res := 0
            i := 0
            nuair-a i < 10 {
                i = i + 1
                má i % 2 == 0 {
                    chun-cinn
                }
                res = res + i
            }`,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test le idir loops", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 10,
            inp: `
            res := 0
            le i idir (0, 10)
                res = res + 1`,
        },
        {
            exp: 450,
            inp: `
            res := 0
            le i idir (0,10)
                le i idir ( 0 , 10 )
                    res = res + i `,
        },
        {
            exp: 25,
            inp: `
            >-- Comhair na uimhreacha príomha
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
        },
        {
            exp: 762,
            inp: `
            res := 0
            le x idir (0, 20) {
                le i idir (0, x) {
                    má i % 3 == 0
                        chun-cinn >-- Lean ar aghaidh
                    res = res + i
                }
            }`,
        },
        {
            exp: 762,
            inp: `
            res := 0
            le x idir (0, 20) {
                le i idir (0, x) {
                    má i % 3 == 0
                        chun-cinn >-- Lean ar aghaidh
                    res = res + i
                }
            }`,
        },
        {
            exp: "10987654321",
            inp: `
            res := ''
            le i idir (10, 0)
                res = res + go_téacs(i)
            `,
        },
        {
            exp: 2500,
            inp: `
            res := 0
            le i idir (1, 100, 2)
                res = res + i
            `,
        },
        {
            exp: "10741",
            inp: `
            res := ''
            le i idir (10, 0, -3)
                res = res + go_téacs(i)
            `,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test function calls", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            env: Environment.from([
                ["sum", {
                    ainm: "sum",
                    arity: () => 2,
                    call: async (args) => {
                        return (args[0] as number) + (args[1] as number);
                    },
                }],
            ]),
            exp: 42,
            inp: `res := sum(12*3, 4+2)`,
        },
        {
            env: Environment.from([
                ["sum", {
                    ainm: "sum",
                    arity: () => 2,
                    call: async (args) => {
                        return (args[0] as number) + (args[1] as number);
                    },
                }],
                ["square", {
                    ainm: "square",
                    arity: () => 1,
                    call: async (args) => {
                        return (args[0] as number) * (args[0] as number);
                    },
                }],
            ]),
            exp: 0,
            inp: `res := sum(square(3), square(4)) - square(5)`,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test function definitions", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 45,
            inp: `
            res := 0
            gníomh addToRes(x) {
                res = res + x
            }
            le i idir (1, 10)
                addToRes(i)
            `,
        },
        {
            exp: 10,
            inp: `
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
        },
        {
            exp: 55,
            inp: `
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
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test toradh", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 25,
            inp: `
            gníomh sq(x) {
                toradh x * x
            }
            gníomh sm(a, b) {
                toradh a + b
            }
            res := sm(sq(3), sq(4))
            `,
        },
        {
            exp: 4,
            inp: `
            >-- Feidhm Ackermann --<
            gníomh A(m, n) {
                má m == 0
                    toradh n + 1
                má m > 0 & n == 0
                    toradh A(m - 1, 1)
                toradh A(m - 1, A(m, n - 1))
            }
            res := A(1, 2)
            `,
        },
        {
            exp: null,
            inp: `
            gníomh f(x) { }
            res := f(3)`,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test postfix ops", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 3,
            inp: `
                gníomh glf() {
                    gníomh i(x) {
                        toradh [x]
                    }
                    toradh i
                }
                res := glf()(3)[0]
            `,
        },
        {
            exp: [2, 4],
            inp: `
                gníomh glf(x) {
                    gníomh i() {
                        toradh [x,2*x]
                    }
                    toradh i
                }
                ls := [glf(1), glf(2), glf(3)]
                res := ls[1]()
            `,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test arrays", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: [0, 1, 2],
            inp: `
            res := [0,0,0]
            le i idir (0, 3) {
                res[i] = i
            }
            `,
        },
        {
            exp: 3,
            inp: `
            res := fad([0,0,0])
            `,
        },
        {
            exp: 0,
            inp: `
            res := fad([])
            `,
        },
        {
            exp: 18,
            inp: `
            arr := [
                [0,0,0],
                [0,0,0],
                [0,0,0]
            ]
            le i idir (0, 3)
                le j idir(0, 3)
                    arr[i][j] = i + j
            res := 0
            le i idir (0, 3)
                le j idir (0, 3)
                    res = res + arr[i][j]
            `,
        },
        {
            exp: [1, 2, 3, 4, 5, 6],
            inp: `
            lsa := [1,2,3]
            lsb := [4,5,6]
            res := lsa + lsb
            lsa[0] = 0
            lsb[0] = 0
            `,
        },
        {
            exp: [1, 2, 3, 1, 2, 3],
            inp: `
            ls := [1,2,3]
            res := ls*2
            ls[1] = 1
            `,
        },
        {
            exp: [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3],
            inp: `
            ls := [1,2,3]
            res := (ls*2)+(ls+ls)
            `,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test obj lookups", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            env: Environment.from([
                ["b", {
                    ainm: "b",
                    getAttr: (s: string) => s === "a" ? true : null,
                    setAttr: () => undefined,
                }],
            ]),
            exp: true,
            inp: "res := a@b",
        },
        {
            env: Environment.from([
                ["b", {
                    ainm: "b",
                    getAttr: (s: string) => s === "a" ? true : null,
                    setAttr: () => undefined,
                }],
            ]),
            exp: null,
            inp: "res := b@b",
        },
        {
            env: Environment.from([
                ["c", {
                    ainm: "c",
                    getAttr: (s: string) => s === "b" ?
                        {
                            ainm: "",
                            getAttr: (at: string) => at === "a" ? {
                                ainm: "",
                                arity: () => 0,
                                call: (): Promise<Value> => {
                                    return Promise.resolve("0");
                                },
                            } : null,
                            setAttr: () => undefined,
                        }
                    : null,
                    setAttr: () => undefined,
                }],
            ]),
            exp: "0",
            inp: "res := a@b@c()[0]",
        },
        // Regression test for variable binding bug
        {
            env: Environment.from([
                ["b", {
                    ainm: "b",
                    getAttr: (s: string) => s === "res" ? true : null,
                    setAttr: () => undefined,
                }],
            ]),
            exp: true,
            inp: "res := res@b",
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test creatlach stmt", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 25,
            inp: `
            creatlach A {
                gníomh B(x) {
                    toradh x*x
                }
            }
            a := A()
            res := B@a(5)`,
        },
        {
            exp: "ceart",
            inp: `
            creatlach A {
                gníomh B() {
                    creatlach C {
                        gníomh D() {
                            toradh 'ceart'
                        }
                    }
                    toradh C()
                }
            }
            res := D@(B@(A())())()
            `,
        },
        {
            exp: 25,
            inp: `
            creatlach A {
                gníomh a(x) {
                    toradh x * x
                }
                gníomh b(a, b) {
                    toradh a@seo(a) + a@seo(b)
                }
            }
            a := A()
            res := b@a(3, 4)
            `,
        },
        {
            exp: 25,
            inp: `
            creatlach a {
                gníomh cearn(x) {
                    toradh x * x
                }
            }
            creatlach b ó a {
                gníomh bearna (a, b) {
                    toradh cearn@seo(a) + cearn@seo(b)
                }
            }
            res := bearna@(b())(3, 4)
            `,
        },
        {
            exp: 2,
            inp: `
            creatlach a {
                gníomh tst(x) {
                    toradh x + 1
                }
            }
            creatlach b ó a {
                gníomh tst (x) {
                    toradh x - 1
                }
            }
            res := tst@(b())(3)
            `,
        },
        {
            exp: 3,
            inp: `
            creatlach a {
                gníomh tst(x) {
                    toradh x + 1
                }
            }
            creatlach b ó a {
                gníomh tst (x) {
                    toradh x - 1
                }
                gníomh b() {
                    toradh tst@seo(4)
                }
            }
            res := b@(b())()
            `,
        },
        {
            exp: 4,
            inp: `
            creatlach Dronuilleoige {
                gníomh nua(fad, leithead) {
                    fad@seo = fad
                    leithead@seo = leithead
                }
                gníomh achar() {
                    toradh fad@seo * leithead@seo
                }
            }
            creatlach Cearnóg ó Dronuilleoige {
                gníomh nua(fad) {
                    nua@tuis(fad, fad)
                }
            }
            cr := Cearnóg(2)
            res := achar@cr()
            `,
        },
        {
            exp: 20,
            inp: `
            creatlach A {
                gníomh f(x) {
                    toradh 2*x
                }
            }
            creatlach B ó A {
                gníomh f(x) {
                    toradh 2 + x
                }
                gníomh g(x) {
                    toradh f@seo(x) + f@tuis(x)
                }
            }
            b := B()
            res := g@b(6)
            `,
        },
        {
            exp: null,
            inp: `
            creatlach A {}
            a := A()
            x@a = neamhní
            res := x@a`,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test object assignment", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 1,
            inp: `
            creatlach A {}
            a := A()
            test@a = 1
            res := test@a
            `,
        },
        {
            exp: "dia duit",
            inp: `
            creatlach A {
                gníomh f(x) {
                    test@seo = x
                }
            }
            a := A()
            f@a('dia duit')
            res := test@a
            `,
        },
        {
            exp: "dia duit",
            inp: `
            creatlach A {
                gníomh f(x) {
                    test@seo = x
                }
            }
            a := A()
            f@a('dia duit')
            res := test@a
            `,
        },
        {
            exp: "Eoin is ainm dom",
            inp: `
            creatlach B {
                gníomh caint() {
                    toradh ainm@seo + ' is ainm dom'
                }
            }
            creatlach A ó B {}
            a := A()
            ainm@a = 'Eoin'
            res := caint@a()
            `,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test constructor", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: "Eoin",
            inp: `
            creatlach Duine {
                gníomh nua(ainm) {
                    ainm@seo = ainm
                }
            }
            mise := Duine('Eoin')
            res := ainm@mise
            `,
        },
        {
            exp: "Is mise Eoin agus táim 21 bliana d'aois",
            inp: `
            creatlach Duine {
                gníomh nua(ainm, aois) {
                    ainm@seo = ainm
                    aois@seo = aois
                }
                gníomh caint() {
                    toradh 'Is mise ' + ainm@seo + ' agus táim ' + go_téacs(aois@seo) + ' bliana d\\'aois'
                }
            }
            mise := Duine('Eoin', 21)
            res := caint@mise()
            `,
        },
        {
            env: Environment.from([
                ["dronuilleog", new CreatlachImpl("dronuilleog", new Map(
                    [
                        ["nua", new GníomhWrap(
                            "nua",
                            2,
                            (seo: Rud, args: Value[]) => {
                                seo.setAttr("ard", args[0]);
                                seo.setAttr("lthd", args[1]);
                                return Promise.resolve(null);
                            },
                        )],
                        ["achar", new GníomhWrap(
                            "achar",
                            0,
                            (seo: Rud) => {
                                const h = seo.getAttr("ard");
                                const w = seo.getAttr("lthd");
                                Asserts.assertNumber(h);
                                Asserts.assertNumber(w);
                                return Promise.resolve(h * w);
                            },
                        )],
                    ],
                ))],
            ]),
            exp: 16,
            inp: `
            creatlach cearnóg ó dronuilleog {
                gníomh nua(l) {
                    nua@tuis(l, l)
                }
            }
            c := cearnóg(4)
            res := achar@c()
            `,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

test("context stop test", async () => {
    const prog = `
        x := 0
        nuair-a fíor {
            x = x + 1
        }`;
    const p = new Parser(prog);
    const res = p.parse();
    const i = new Interpreter();
    expect(res.errs).toEqual([]);
    expect(res.ast).not.toBeNull();
    setTimeout(() => i.stop());
    await i.interpret(res.ast!);
});

describe("test comments", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 16,
            inp: `
            >-- Set res to 16
            res := 16
            `,
        },
        {
            exp: 42,
            inp: `
            res := >-- initialise res --< 42
            `,
        },
        {
            exp: 314,
            inp: `
            res := 314
            >-- res is now 314
            `,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env)
                i.global.env = c.env;
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

describe("test anonymous functions", () => {
    interface TC { inp: string; exp: Value; env?: Environment; }
    const cases: TC[] = [
        {
            exp: 4,
            inp: `
            fn := gníomh (x) { toradh x + 2 }
            res := fn(2)
            `,
        },
        {
            exp: 4,
            inp: `
            res := gníomh (x) { toradh x + 2 }(2)
            `,
        },
        {
            exp: 13,
            inp: `
            gníomh adder(x) {
                toradh gníomh (y) {
                    toradh x + y
                }
            }
            add3 := adder(3)
            res := add3(10)
            `,
        },
    ];
    for (const c of cases) {
        test(`inp: ${c.inp}`, async () => {
            const i = new Interpreter();
            if (c.env) {
                i.global.env = c.env;
            }
            const p = new Parser(c.inp);
            const res = p.parse();
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            await i.interpret(res.ast!);
            expect(i.global.env.getGlobalValDirect("res")).toEqual(c.exp);
        });
    }
});

test("stop codladh test", async () => {
    const prog = `
        codladh(1000000)
    `;
    const p = new Parser(prog);
    const res = p.parse();
    const i = new Interpreter();
    expect(res.errs).toEqual([]);
    expect(res.ast).not.toBeNull();
    setTimeout(() => i.stop());
    await i.interpret(res.ast!);
});

test("stop action test", async () => {
    let wasRan = false;
    const i = new Interpreter(
        10,
        () => [
            [
                "dontrunme",
                {
                    ainm: "dontrunme",
                    arity: () => 0,
                    call: () => {
                        wasRan = true;
                        return Promise.resolve(null);
                    },
                },
            ],
        ]
    );
    const prog = `
    stop()
    dontrunme()
    `;
    const p = new Parser(prog);
    const res = p.parse();
    expect(res.errs).toEqual([]);
    expect(res.ast).not.toBeNull();
    await i.interpret(res.ast!);
    expect(wasRan).toEqual(false);
});

test("regression test for lexical scoping bug #10", async () => {
    const ast = parse(`
    a := 0
    gníomh fn() {
        gníomh fn() {
            a = a + 1
            toradh a
        }
        a := 1
        toradh fn
    }
    res := fn()()`).ast!;
    const i = new Interpreter();
    await i.interpret(ast);
    expect(i.global.env.getGlobalValDirect("res")).toEqual(1);
});

test("test to ensure co-recursion works for globals", async () => {
    const ast = parse(`
    gníomh a(x) {
        má x == 0
            toradh "a"
        toradh b(x - 1)
    }

    gníomh b(x) {
        má x == 0
            toradh "b"
        toradh a(x - 1)
    }

    res := a(10)`).ast!;
    const i = new Interpreter();
    await i.interpret(ast);
    expect(i.global.env.getGlobalValDirect("res")).toEqual("a");
});

test("Make sure self definition throws error", async () => {
    const direct = parse(`a := a + 2`).ast!;

    const i = new Interpreter();

    await expect(i.interpret(direct)).
        rejects.toThrow("Níl an athróg \"a\" sainithe fós");

    const creatlach = parse(`creatlach A ó A {}`).ast!;
    return expect(i.interpret(creatlach)).
        rejects.toThrow("Níl an athróg \"A\" sainithe fós");
});
