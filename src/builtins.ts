import * as Asserts from "./asserts";
import * as Checks from "./checks";
import { RuntimeError } from "./error";
import { athchuir } from "./teacs";
import { Callable, ObjIntfWrap, Value, callFunc, goTéacs, repr } from "./values";
import { Context } from "./ctx";
import { STOPType } from "./consts";

// Take a 1-ary mathematical function and return a Callable
function mathWrap(ainm: string, fn: (x: number) => number): Callable {
    return {
        ainm,
        arity: () => 1,
        call: ([x]: Value[]) => {
            Asserts.assertNumber(x);
            return Promise.resolve(fn(x));
        },
    };
}

function sleepPromise(ctx: Context, time: number): Promise<null> {
    return new Promise((accept, reject) => {
        let id = 0; // Id of timer, unknown intially, we capture it into the closure

        // rfn is a rejection function. Clear the timer and reject the promise
        const rfn = (s: STOPType) => {
            clearTimeout(id);
            reject(s);
        };

        // We have to cast to any here as Node doesn't use a number as a timeout id
        /* eslint-disable @typescript-eslint/no-explicit-any */
        id = (setTimeout(() => {
            accept(null);
            ctx.removeRejectFn(rfn);
        }, time) as any);
        /* eslint-enable @typescript-eslint/no-explicit-any */

        ctx.addRejectFn(rfn);
    });
}

// Compute all combinations of a string with or without fadas
// at each location with a fada
// e.g. "cúlú" -> [culu,cúlu,culú,cúlú]
// limit to 10 fadas, as the number of outputs is 2 ** #fadas
// and we don't want to be computing thousands of builtin vars
// for one var
export function allFadaCombos(s: string): string[] {
    const fadaMp: { [s: string]: string } = {
        "á": "a", "Á": "A",
        "é": "e", "É": "E",
        "í": "i", "Í": "I",
        "ó": "o", "Ó": "O",
        "ú": "u", "Ú": "U",
    };
    const fadaIdxs = [];
    for(let i = 0; i < s.length; ++i)
        if(s[i] in fadaMp)
            fadaIdxs.push(i);
    if(fadaIdxs.length > 10)
        throw new Error(`Tá an iomarca fada sa focal "${s}".`);
    const combos: string[] = [];
    const lm = 2 ** fadaIdxs.length;
    for(let subset = 0; subset < lm; ++subset) {
        const alt = s.split("");
        for(let i = 0; i < fadaIdxs.length; ++i)
            if((subset & (2 ** i)) !== 0)
                alt[fadaIdxs[i]] = fadaMp[s[fadaIdxs[i]]];
        combos.push(alt.join(""));
    }
    return combos;
}

export function listToAllFadaCombos<X>(ls: [string, X][]): [string, X][] {
    const allCombos: [string, X][] = [];
    for(const [name, val] of ls)
        for(const combo of allFadaCombos(name))
            allCombos.push([combo, val]);
    return allCombos;
}

export function globalBuiltinsFadaCombos(ctx: Context): [string, Value][] {
    return listToAllFadaCombos(getGlobalBuiltins(ctx));
}

function getGlobalBuiltins(ctx: Context): [string, Value][] {
    return [
        [
            // Fad returns length of liosta / téacs
            // Available as a separate function for legacy reasons
            "fad", {
                ainm: "fad",
                arity: () => 1,
                call: async ([ls]: Value[]): Promise<Value> => {
                    Asserts.assertIndexable(ls);
                    return ls.length;
                },
            },
        ],
        [
            // Thar takes a function f and returns the map of f over the liosta
            "thar", {
                ainm: "thar",
                arity: () => 2,
                call: async ([f, ls]: Value[]): Promise<Value> => {
                    Asserts.assertCallable(f);
                    Asserts.assertLiosta(ls);
                    return Promise.all(ls.map(x => callFunc(f, [x])));
                },
            },
        ],
        [
            // args[0]: (téacs | bool | uimhir)
            // go_uimh casts args[0] to a number
            "go_uimh", {
                ainm: "go_uimh",
                arity: () => 1,
                call: (args: Value[]): Promise<number> => {
                    if (Checks.isTéacs(args[0]) || Checks.isBool(args[0]) || Checks.isNumber(args[0])) {
                        return Promise.resolve(Number(args[0]));
                    }
                    throw new RuntimeError(`Níl uimhir, téacs nó bool é ${repr(args[0])}`);
                },
            },
        ],
        [
            // args[0]: any
            // go_téacs casts args[0] to a string
            "go_téacs", {
                ainm: "go_téacs",
                arity: () => 1,
                call: (args: Value[]): Promise<string> => {
                    if (Checks.isTéacs(args[0])) {
                        return Promise.resolve(args[0]);
                    }
                    return Promise.resolve(repr(args[0]));
                },
            },
        ],
        [
            // args[0-1]: number
            // íos returns min of args[0], args[1]
            "íos", {
                ainm: "íos",
                arity: () => 2,
                call: ([a, b]: Value[]): Promise<number | string> => {
                    if (Checks.isNumber(a) && Checks.isNumber(b))
                        return Promise.resolve(Math.min(a, b));
                    if (Checks.isTéacs(a) && Checks.isTéacs(b))
                        return Promise.resolve(a < b ? a : b);
                    throw new RuntimeError(`Ní féidir íos a úsáid le ${repr(a)} agus ${repr(b)}`);
                },
            },
        ],
        [
            // args[0-1]: number
            // uas returns max of args[0], args[1]
            "uas", {
                ainm: "uas",
                arity: () => 2,
                call: ([a, b]: Value[]): Promise<number | string> => {
                    if (Checks.isNumber(a) && Checks.isNumber(b))
                        return Promise.resolve(Math.max(a, b));
                    if (Checks.isTéacs(a) && Checks.isTéacs(b))
                        return Promise.resolve(a > b ? a : b);
                    throw new RuntimeError(`Ní féidir uas a úsáid le ${repr(a)} agus ${repr(b)}`);
                },
            },
        ],
        [
            "codladh",
            {
                ainm: "codladh",
                arity: () => 1,
                call: ([s]: Value[]): Promise<Value> => {
                    Asserts.assertNumber(s);
                    return sleepPromise(ctx, s);
                },
            },
        ],
        [
            "coladh", // DEPRECATED - Left in for legacy reasons only, real spelling is "codladh"
            {
                ainm: "codladh",
                arity: () => 1,
                call: ([s]: Value[]): Promise<Value> => {
                    Asserts.assertNumber(s);
                    return sleepPromise(ctx, s);
                },
            },
        ],
        [
            "stop",
            {
                ainm: "stop",
                arity: () => 0,
                call: (): Promise<null> => {
                    ctx.stop();
                    return Promise.resolve(null);
                },
            },
        ],
        [
            "fan",
            {
                ainm: "fan",
                arity: () => 0,
                call: () => new Promise<null>((_, rej) => { ctx.addRejectFn(rej); }),
            },
        ],
        [
            // Built in maths object
            "mata", new ObjIntfWrap("mata", [
                // constants
                [["pí", "pi"], Math.PI],
                [["e"], Math.E],
                [
                    // Square function
                    ["cearn"], mathWrap("cearn", x => x * x),
                ],
                [
                    // Sqrt function
                    ["fréamh", "freamh"], mathWrap("fréamh", x => {
                        if (x < 0)
                            throw new RuntimeError("Níl fréamh sainmhínithe le uimhir diúltach");
                        return Math.sqrt(x);
                    }),
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
                    }),
                ],
                [
                    // logB function
                    ["logb"], {
                        ainm: "logb",
                        arity: () => 2,
                        call: ([x, b]: Value[]): Promise<number> => {
                            Asserts.assertNumber(x);
                            Asserts.assertNumber(b);
                            if (x <= 0)
                                return Promise.reject(new RuntimeError(`Níl log(${x}) sainmhínithe`));
                            if (b <= 0 || b === 1)
                                return Promise.reject(new RuntimeError(`Níl log i mbun ${b} sainmhínithe`));
                            return Promise.resolve(Math.log(x) / Math.log(b));
                        },
                    },
                ],
                [
                    // power function
                    ["cmhcht"], {
                        ainm: "cmhcht",
                        arity: () => 2,
                        call: ([x, y]: Value[]): Promise<number> => {
                            Asserts.assertNumber(x);
                            Asserts.assertNumber(y);
                            return Promise.resolve(Math.pow(x, y));
                        },
                    },
                ],
                [
                    // Random floating point number between 0 and 1
                    ["rand"], {
                        ainm: "rand",
                        arity: () => 0,
                        call: (): Promise<number> => Promise.resolve(Math.random()),
                    },
                ],
                [
                    // arity: 2; args[0]: number, args[1]: number;
                    // Returns random integer in the range [args[0], args[1]) (exclusive of end)
                    // DEPRECATED
                    ["randUimh"], {
                        ainm: "randUimh",
                        arity: () => 2,
                        call: ([l, r]: Value[]): Promise<number> => {
                            Asserts.assertNumber(l);
                            Asserts.assertNumber(r);
                            return Promise.resolve(Math.floor(Math.random() * (r - l) + l));
                        },
                    },
                ],
                [
                    // arity: 2; args[0]: number, args[1]: number;
                    // Returns random integer in the range [args[0], args[1]] (inclusive)
                    ["slánuimh_rand", "slanuimh_rand"], {
                        ainm: "slánuimh_rand",
                        arity: () => 2,
                        call: ([l, r]: Value[]): Promise<number> => {
                            Asserts.assertNumber(l);
                            Asserts.assertNumber(r);
                            return Promise.resolve(Math.floor(Math.random() * (r - l + 1) + l));
                        },
                    },
                ],
            ]),
        ],
    ];
}

const téacsOpsList: [string, (s: string) => Value][] = [
    [
        "fad", s => s.length,
    ],
    [
        "athchuir",
        (s: string) => {
            return {
                ainm: "athchuir",
                arity: () => 2,
                call: async ([b, c]: Value[]) => {
                    Asserts.assertTéacs(b);
                    Asserts.assertTéacs(c);
                    return athchuir(s, b, c);
                },
            };
        },
    ],
    [
        // args[1]: téacs
        // roinn calls split on s with args[0] as divider
        "roinn", s => {
            return {
                ainm: "roinn",
                arity: () => 1,
                call: async ([b]: Value[]): Promise<Value> => {
                    Asserts.assertTéacs(b);
                    return s.split(b);
                },
            };
        },
    ],
    [
        // args[1]: number; args[2]: number
        // Cuid returns a sublist of s from args[0] to args[1]
        "cuid", s => {
            return {
                ainm: "cuid",
                arity: () => 2,
                call: async ([l, r]: Value[]): Promise<Value> => {
                    Asserts.assertNumber(l);
                    Asserts.assertNumber(r);
                    return s.substring(l, r);
                },
            };
        },
    ],
    [
        // go_liosta returns a list of the elements of s
        "go_liosta", s => {
            return {
                ainm: "go_liosta",
                arity: () => 0,
                call: () => Promise.resolve(s.split("")),
            };
        },
    ],
];
export const téacsBuiltins = new Map(listToAllFadaCombos(téacsOpsList));

const liostaOpsList: [string, (ls: Value[]) => Value][] = [
    [
        "fad", ls => ls.length,
    ],
    [
        "sórtáil", ls => {
            return {
                ainm: "sórtáil",
                arity: () => 0,
                call: () => Promise.resolve(ls.sort()),
            };
        },
    ],
    [
        "sortail", ls => {
            return {
                ainm: "sórtáil",
                arity: () => 0,
                call: () => Promise.resolve(ls.sort()),
            };
        },
    ],
    [
        // args[0]: number; args[1]: number
        // Cuid returns a sublist of ls from args[0] to args[1]
        "cuid", ls => {
            return {
                ainm: "cuid",
                arity: () => 2,
                call: async ([l, r]: Value[]): Promise<Value> => {
                    Asserts.assertNumber(l);
                    Asserts.assertNumber(r);
                    return ls.slice(l, r);
                },
            };
        },
    ],
    [
        // args[0]: téacs;
        // nasc joins the elements of ls with the args[0] between each element
        // it first casts everything to téacs with go_téacs
        "nasc", ls => {
            return {
                ainm: "nasc",
                arity: () => 1,
                call: async ([a]: Value[]): Promise<Value> => {
                    Asserts.assertTéacs(a);
                    return ls.map(goTéacs).join(a);
                },
            };
        },
    ],
    [
        "cóip", ls => {
            return {
                ainm: "cóip",
                arity: () => 0,
                call: async (): Promise<Value> => {
                    return [...ls];
                },
            };
        },
    ],
    [
        "scrios", ls => {
            return {
                ainm: "scrios",
                arity: () => 1,
                call: ([a]: Value[]): Promise<Value> => {
                    Asserts.assertNumber(a);
                    if(a >= ls.length || a < 0)
                        return Promise.reject(new RuntimeError(`Ní innéacs den liosta é ${repr(a)}`));
                    ls.splice(a, 1);
                    return Promise.resolve(ls);
                },
            };
        },
    ],
    [
        "aimsigh", ls => {
            return {
                ainm: "aimsigh",
                arity: () => 1,
                call: ([a]: Value[]): Promise<Value> => {
                    return Promise.resolve(ls.indexOf(a));
                },
            };
        },
    ],
    [
        "scrios_cúl", ls => {
            return {
                ainm: "scrios_cúl",
                arity: () => 0,
                call: (): Promise<Value> => {
                    const a = ls.pop();
                    if(a === undefined) // list is empty
                        return Promise.reject(new RuntimeError(`Ní feidir cúl liosta folamh a scriosadh`));
                    return Promise.resolve(a);
                },
            };
        },
    ],
];
export const liostaBuiltins = new Map(listToAllFadaCombos(liostaOpsList));
