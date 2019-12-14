import { callFunc, Value, Asserts } from './values';

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
];

