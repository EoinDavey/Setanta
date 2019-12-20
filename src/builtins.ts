import { ObjWrap, goLitreacha, callFunc, Value, Asserts, Checks } from './values';
import { RuntimeError } from './error';
import { athchuir } from './litreacha';

export const Builtins : [string, Value][] = [
    [
        "fad", {
            ainm: "fad",
            arity : () => 1,
            call : async (args : Value[]) : Promise<Value> => {
                return Asserts.assertIndexable(args[0]).length;
            }
        },
    ],
    [
        "thar", {
            ainm: "thar",
            arity : () => 2,
            call : async (args : Value[]) : Promise<Value> => {
                const f = Asserts.assertCallable(args[0]);
                const ls = Asserts.assertLiosta(args[1]);
                return Promise.all(ls.map(x => callFunc(f, [x])));
            }
        },
    ],
    [
        "cuid", {
            ainm: "cuid",
            arity : () => 3,
            call : async (args : Value[]) : Promise<Value> => {
                const l = Asserts.assertNumber(args[1]);
                const r = Asserts.assertNumber(args[2]);
                if(Checks.isLiosta(args[0])){
                    const ls = Asserts.assertLiosta(args[0]);
                    return ls.slice(l, r);
                } else if(Checks.isLitreacha(args[0])){
                    const s = Asserts.assertLitreacha(args[0]);
                    return s.substr(l, r);
                }
                throw new RuntimeError(`Níl liosta nó litreacha é ${goLitreacha(args[0])}`);
            }
        },
    ],
    [
        "roinn", {
            ainm: "roinn",
            arity : () => 2,
            call : async (args : Value[]) : Promise<Value> => {
                const a = Asserts.assertLitreacha(args[0]);
                const b = Asserts.assertLitreacha(args[1]);
                return a.split(b);
            }
        },
    ],
    [
        "athchuir", {
            ainm: "athchuir",
            arity : () => 3,
            call : async (args : Value[]) : Promise<Value> => {
                const a = Asserts.assertLitreacha(args[0]);
                const b = Asserts.assertLitreacha(args[1]);
                const c = Asserts.assertLitreacha(args[2]);
                return athchuir(a,b,c);
            }
        },
    ],
    [
        "go_uimh", {
            ainm : "go_uimh",
            arity : () => 1,
            call : (args : Value[]) : Promise<number> => {
                if(Checks.isLitreacha(args[0]) || Checks.isBool(args[0]) || Checks.isNumber(args[0]))
                    return Promise.resolve(Number(args[0]));
                throw new RuntimeError(`Níl uimhir, litreacha nó bool é ${goLitreacha(args[0])}`);
            }
        }
    ],
    [
        "go_lit", {
            ainm : "go_lit",
            arity : () => 1,
            call : (args : Value[]) : Promise<string> => {
                if(Checks.isLitreacha(args[0]))
                    return Promise.resolve(args[0]);
                return Promise.resolve(goLitreacha(args[0]));
            }
        }
    ],
    [
        "mata", new ObjWrap("mata", [
            ["pi",Math.PI],
            ["e",Math.E],
            [
                "cearn", {
                    ainm : "cearn",
                    arity: () => 1,
                    call: (args : Value[]) : Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        return Promise.resolve(x * x);
                    }
                },
            ],
            [
                "fréamh", {
                    ainm : "fréamh",
                    arity: () => 1,
                    call: (args : Value[]) : Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        return Promise.resolve(Math.sqrt(x * x));
                    }
                },
            ],
            [
                "freamh", {
                    ainm : "fréamh",
                    arity: () => 1,
                    call: (args : Value[]) : Promise<number> => {
                        const x = Asserts.assertNumber(args[0]);
                        return Promise.resolve(Math.sqrt(x * x));
                    }
                },
            ],
        ])
    ],
];
