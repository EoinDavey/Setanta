import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { CreatlachImpl } from "./creatlach";
import { RuntimeError } from "./error";
import { GníomhWrap } from "./gniomh";
import { athchuir } from "./teacs";
import { Rud } from "./rud";
import { ObjIntfWrap, Callable, callFunc, goTéacs, Value } from "./values";

// Take a 1-ary mathematical function and return a Callable
function mathWrap(ainm: string, fn: (x: number) => number): Callable {
    return {
        ainm,
        arity: () => 1,
        call: (args: Value[]) => {
            const x = Asserts.assertNumber(args[0]);
            return Promise.resolve(fn(x));
        }
    }
}

export const GlobalBuiltins: [string, Value][] = [
    [
        // Fad returns length of liosta / téacs
        // Available as a separate function for legacy reasons
        "fad", {
            ainm: "fad",
            arity : () => 1,
            call : async (args: Value[]): Promise<Value> => {
                return Asserts.assertIndexable(args[0]).length;
            },
        },
    ],
    [
        // Thar takes a function f and returns the map of f over the liosta
        "thar", {
            ainm: "thar",
            arity : () => 2,
            call : async (args: Value[]): Promise<Value> => {
                const f = Asserts.assertCallable(args[0]);
                const ls = Asserts.assertLiosta(args[1]);
                return Promise.all(ls.map((x) => callFunc(f, [x])));
            },
        },
    ],
    [
        // args[0]: (téacs | bool | uimhir)
        // go_uimh casts args[0] to a number
        "go_uimh", {
            ainm : "go_uimh",
            arity : () => 1,
            call : (args: Value[]): Promise<number> => {
                if (Checks.isTéacs(args[0]) || Checks.isBool(args[0]) || Checks.isNumber(args[0])) {
                    return Promise.resolve(Number(args[0]));
                }
                throw new RuntimeError(`Níl uimhir, téacs nó bool é ${goTéacs(args[0])}`);
            },
        },
    ],
    [
        // args[0]: any
        // go_téacs casts args[0] to a string
        "go_téacs", {
            ainm : "go_téacs",
            arity : () => 1,
            call : (args: Value[]): Promise<string> => {
                if (Checks.isTéacs(args[0])) {
                    return Promise.resolve(args[0]);
                }
                return Promise.resolve(goTéacs(args[0]));
            },
        },
    ],
    [
        // args[0]: any
        // go_téacs casts args[0] to a string
        "go_teacs", {
            ainm : "go_téacs",
            arity : () => 1,
            call : (args: Value[]): Promise<string> => {
                if (Checks.isTéacs(args[0])) {
                    return Promise.resolve(args[0]);
                }
                return Promise.resolve(goTéacs(args[0]));
            },
        },
    ],
    [
        // args[0-1]: number
        // íos returns min of args[0], args[1]
        "íos", {
            ainm : "íos",
            arity : () => 2,
            call : (args: Value[]): Promise<number> => {
                const a = Asserts.assertNumber(args[0]);
                const b = Asserts.assertNumber(args[1]);
                return Promise.resolve(Math.min(a, b));
            },
        },
    ],
    [
        // args[0-1]: number
        // íos returns min of args[0], args[1]
        "ios", {
            ainm : "íos",
            arity : () => 2,
            call : (args: Value[]): Promise<number> => {
                const a = Asserts.assertNumber(args[0]);
                const b = Asserts.assertNumber(args[1]);
                return Promise.resolve(Math.min(a, b));
            },
        },
    ],
    [
        // args[0-1]: number
        // uas returns max of args[0], args[1]
        "uas", {
            ainm : "uas",
            arity : () => 2,
            call : (args: Value[]): Promise<number> => {
                const a = Asserts.assertNumber(args[0]);
                const b = Asserts.assertNumber(args[1]);
                return Promise.resolve(Math.max(a, b));
            },
        },
    ],
    [
        // Built in maths object
        "mata", new ObjIntfWrap("mata", [
            // constants
            [["pi"], Math.PI],
            [["e"], Math.E],
            [
                // Square function
                ["cearn"], mathWrap("cearn", x => x*x)
            ],
            [
                // Sqrt function
                ["fréamh", "freamh"], mathWrap("fréamh", Math.sqrt)
            ],
            [["cos"],  mathWrap("cos", Math.cos)],
            [["sin"], mathWrap("sin", Math.sin)],
            [["tan"], mathWrap("tan", Math.tan)],
            [["acos"],  mathWrap("acos", Math.acos)],
            [["asin"], mathWrap("asin", Math.asin)],
            [["atan"], mathWrap("atan", Math.atan)],
            [["dearbh"], mathWrap("dearbh", Math.abs)],
            [["eas"], mathWrap("eas", Math.exp)],
            [
                // log function
                ["log"], mathWrap("log", x => {
                    if (x <= 0) {
                        throw new RuntimeError(`Níl log(0) sainmhínithe`);
                    }
                    return Math.log(x);
                })
            ],
            [
                // logB function
                ["logb"], {
                    ainm : "logb",
                    arity: () => 2,
                    call: (args: Value[]): Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        const b = Asserts.assertNumber(args[1]);
                        if (x <= 0) {
                            return Promise.reject(new RuntimeError(`Níl log(${x}) sainmhínithe`));
                        }
                        if (b <= 0 || b === 1) {
                            return Promise.reject(new RuntimeError(`Níl log i mbun ${b} sainmhínithe`));
                        }
                        return Promise.resolve(Math.log(x) / Math.log(b));
                    },
                },
            ],
            [
                // power function
                ["cmhcht"], {
                    ainm : "cmhcht",
                    arity: () => 2,
                    call: (args: Value[]): Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        const y = Asserts.assertNumber(args[1]);
                        return Promise.resolve(Math.pow(x, y));
                    },
                },
            ],
            [
                // Random floating point number between 0 and 1
                ["rand"], {
                    ainm: "rand",
                    arity: () => 0,
                    call: (args: Value[]): Promise<number> => Promise.resolve(Math.random()),
                },
            ],
            [
                // arity: 2; args[0]: number, args[1]: number;
                // Returns random integer in the range [args[0], args[1])
                ["randUimh"], {
                    ainm: "rand",
                    arity: () => 2,
                    call: (args: Value[]): Promise<number> => {
                        const l = Asserts.assertNumber(args[0]);
                        const r = Asserts.assertNumber(args[1]);
                        return Promise.resolve(Math.floor(Math.random() * (r - l) + l));
                    },
                },
            ],
        ]),
    ],
];

const téacsOpsList: [string, (s: string) => Value][] = [
    [
        "fad", s => s.length
    ],
    [
        "athchuir",
        (s: string) => {
            return {
                ainm: "athchuir",
                arity : () => 2,
                call : async (args: Value[]) => {
                    const b = Asserts.assertTéacs(args[0]);
                    const c = Asserts.assertTéacs(args[1]);
                    return athchuir(s, b, c);
                },
            }
        },
    ],
    [
        // args[1]: téacs
        // roinn calls split on s with args[0] as divider
        "roinn", s => {
            return {
                ainm: "roinn",
                arity : () => 1,
                call : async (args: Value[]): Promise<Value> => {
                    const b = Asserts.assertTéacs(args[0]);
                    return s.split(b);
                },
            }
        },
    ],
    [
        // args[1]: number; args[2]: number
        // Cuid returns a sublist of s from args[0] to args[1]
        "cuid", s => {
            return {
                ainm: "cuid",
                arity : () => 2,
                call : async (args: Value[]): Promise<Value> => {
                    const l = Asserts.assertNumber(args[0]);
                    const r = Asserts.assertNumber(args[1]);
                    return s.substr(l, r);
                },
            }
        },
    ],
    [
        // go_liosta returns a list of the elements of s
        "go_liosta", s => {
            return {
                ainm: "go_liosta",
                arity : () => 0,
                call : async (args: Value[]): Promise<Value> => s.split("")
            }
        },
    ],
];
export const téacsBuiltins = new Map(téacsOpsList);

const liostaOpsList: [string, (ls: Value[]) => Value][] = [
    [
        "fad", ls => ls.length
    ],
    [
        "sortáil", ls => {
            return {
                ainm: "sortáil",
                arity : () => 0,
                call : async (args: Value[]) => ls.sort()
            }
        },
    ],
    [
        "sortail", ls => {
            return {
                ainm: "sortáil",
                arity : () => 0,
                call : async (args: Value[]) => ls.sort()
            }
        },
    ],
    [
        // args[0]: number; args[1]: number
        // Cuid returns a sublist of ls from args[0] to args[1]
        "cuid", ls => {
            return {
                ainm: "cuid",
                arity : () => 2,
                call : async (args: Value[]): Promise<Value> => {
                    const l = Asserts.assertNumber(args[0]);
                    const r = Asserts.assertNumber(args[1]);
                    return ls.slice(l, r);
                },
            }
        },
    ],
    [
        // args[0]: téacs;
        // nasc joins the elements of ls with the args[0] between each element
        // it first casts everything to téacs with go_téacs
        "nasc", ls => {
            return {
                ainm: "nasc",
                arity : () => 1,
                call : async (args: Value[]): Promise<Value> => {
                    const a = Asserts.assertTéacs(args[0]);
                    return ls.map(goTéacs).join(a);
                },
            }
        },
    ],
];
export const liostaBuiltins = new Map(liostaOpsList);
