import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { CreatlachImpl } from "./creatlach";
import { RuntimeError } from "./error";
import { GníomhWrap } from "./gniomh";
import { athchuir } from "./teacs";
import { Rud } from "./rud";
import { Callable, callFunc, goTéacs, ObjWrap, Value } from "./values";

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

export const Builtins: [string, Value][] = [
    [
        // Fad returns length of liosta / téacs
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
        // args[0]: (liosta | téacs); args[1]: number; args[2]: number
        // Cuid returns a sublist of args[0] from args[1] to args[2]
        "cuid", {
            ainm: "cuid",
            arity : () => 3,
            call : async (args: Value[]): Promise<Value> => {
                const l = Asserts.assertNumber(args[1]);
                const r = Asserts.assertNumber(args[2]);
                if (Checks.isLiosta(args[0])) {
                    const ls = Asserts.assertLiosta(args[0]);
                    return ls.slice(l, r);
                } else if (Checks.isTéacs(args[0])) {
                    const s = Asserts.assertTéacs(args[0]);
                    return s.substr(l, r);
                }
                throw new RuntimeError(`Níl liosta nó téacs é ${goTéacs(args[0])}`);
            },
        },
    ],
    [
        // args[0]: téacs, args[1]: téacs
        // roinn calls split on args[0] with args[1] as divider
        "roinn", {
            ainm: "roinn",
            arity : () => 2,
            call : async (args: Value[]): Promise<Value> => {
                const a = Asserts.assertTéacs(args[0]);
                const b = Asserts.assertTéacs(args[1]);
                return a.split(b);
            },
        },
    ],
    [
        // args[0]: téacs, args[1]: téacs, args[2]: téacs
        // replace all occurrences of args[1] in args[0] with args[2]
        "athchuir", {
            ainm: "athchuir",
            arity : () => 3,
            call : async (args: Value[]): Promise<Value> => {
                const a = Asserts.assertTéacs(args[0]);
                const b = Asserts.assertTéacs(args[1]);
                const c = Asserts.assertTéacs(args[2]);
                return athchuir(a, b, c);
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
        "mata", new ObjWrap("mata", [
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
