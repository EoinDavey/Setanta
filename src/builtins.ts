import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { CreatlachImpl } from "./creatlach";
import { RuntimeError } from "./error";
import { GníomhWrap } from "./gniomh";
import { athchuir } from "./litreacha";
import { Rud } from "./rud";
import { callFunc, goLitreacha, ObjWrap, Value } from "./values";

export const Builtins: Array<[string, Value]> = [
    [
        // Fad returns length of liosta / litreacha
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
        // args[0]: (liosta | litreacha); args[1]: number; args[2]: number
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
                } else if (Checks.isLitreacha(args[0])) {
                    const s = Asserts.assertLitreacha(args[0]);
                    return s.substr(l, r);
                }
                throw new RuntimeError(`Níl liosta nó litreacha é ${goLitreacha(args[0])}`);
            },
        },
    ],
    [
        // args[0]: litreacha, args[1]: litreacha
        // roinn calls split on args[0] with args[1] as divider
        "roinn", {
            ainm: "roinn",
            arity : () => 2,
            call : async (args: Value[]): Promise<Value> => {
                const a = Asserts.assertLitreacha(args[0]);
                const b = Asserts.assertLitreacha(args[1]);
                return a.split(b);
            },
        },
    ],
    [
        // args[0]: litreacha, args[1]: litreacha, args[2]: litreacha
        // replace all occurrences of args[1] in args[0] with args[2]
        "athchuir", {
            ainm: "athchuir",
            arity : () => 3,
            call : async (args: Value[]): Promise<Value> => {
                const a = Asserts.assertLitreacha(args[0]);
                const b = Asserts.assertLitreacha(args[1]);
                const c = Asserts.assertLitreacha(args[2]);
                return athchuir(a, b, c);
            },
        },
    ],
    [
        // args[0]: (litreacha | bool | uimhir)
        // go_uimh casts args[0] to a number
        "go_uimh", {
            ainm : "go_uimh",
            arity : () => 1,
            call : (args: Value[]): Promise<number> => {
                if (Checks.isLitreacha(args[0]) || Checks.isBool(args[0]) || Checks.isNumber(args[0])) {
                    return Promise.resolve(Number(args[0]));
                }
                throw new RuntimeError(`Níl uimhir, litreacha nó bool é ${goLitreacha(args[0])}`);
            },
        },
    ],
    [
        // args[0]: any
        // go_uimh casts args[0] to a number
        "go_lit", {
            ainm : "go_lit",
            arity : () => 1,
            call : (args: Value[]): Promise<string> => {
                if (Checks.isLitreacha(args[0])) {
                    return Promise.resolve(args[0]);
                }
                return Promise.resolve(goLitreacha(args[0]));
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
                ["cearn"], {
                    ainm : "cearn",
                    arity: () => 1,
                    call: (args: Value[]): Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        return Promise.resolve(x * x);
                    },
                },
            ],
            [
                // Sqrt function
                ["fréamh", "freamh"], {
                    ainm : "fréamh",
                    arity: () => 1,
                    call: (args: Value[]): Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        return Promise.resolve(Math.sqrt(x));
                    },
                },
            ],
            [
                // cos function
                ["cos"], {
                    ainm : "cos",
                    arity: () => 1,
                    call: (args: Value[]): Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        return Promise.resolve(Math.cos(x));
                    },
                },
            ],
            [
                // cos function
                ["sin"], {
                    ainm : "sin",
                    arity: () => 1,
                    call: (args: Value[]): Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        return Promise.resolve(Math.sin(x));
                    },
                },
            ],
            [
                // log function
                ["log"], {
                    ainm : "log",
                    arity: () => 1,
                    call: (args: Value[]): Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        if (x <= 0) {
                            return Promise.reject(new RuntimeError(`Níl log(0) sainmhínithe`));
                        }
                        return Promise.resolve(Math.log(x));
                    },
                },
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
