import { callFunc, Value, Asserts, Checks } from './values';
import { RuntimeError } from './error';
import { athchuir } from './litreacha';

export const Builtins : [string, Value][] = [
    [
        "fad", {
            arity : () => 1,
            call : (args : Value[]) : Value => {
                return Asserts.assertIndexable(args[0]).length;
            }
        },
    ],
    [
        "thar", {
            arity : () => 2,
            call : (args : Value[]) : Value => {
                const f = Asserts.assertCallable(args[0]);
                const ls = Asserts.assertLiosta(args[1]);
                return ls.map(x => callFunc(f, [x]));
            }
        },
    ],
    [
        "cuid", {
            arity : () => 3,
            call : (args : Value[]) : Value => {
                const l = Asserts.assertNumber(args[1]);
                const r = Asserts.assertNumber(args[2]);
                if(Checks.isLiosta(args[0])){
                    const ls = Asserts.assertLiosta(args[0]);
                    return ls.slice(l, r);
                } else if(Checks.isLitreacha(args[0])){
                    const s = Asserts.assertLitreacha(args[0]);
                    return s.substr(l, r);
                }
                throw new RuntimeError(`Níl liosta nó litreacha é ${args[0]}`);
            }
        },
    ],
    [
        "roinn", {
            arity : () => 2,
            call : (args : Value[]) : Value => {
                const a = Asserts.assertLitreacha(args[0]);
                const b = Asserts.assertLitreacha(args[1]);
                return a.split(b);
            }
        },
    ],
    [
        "athchuir", {
            arity : () => 3,
            call : (args : Value[]) : Value => {
                const a = Asserts.assertLitreacha(args[0]);
                const b = Asserts.assertLitreacha(args[1]);
                const c = Asserts.assertLitreacha(args[2]);
                return athchuir(a,b,c);
            }
        },
    ],
];
