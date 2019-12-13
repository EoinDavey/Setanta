import { callFunc, Value, Asserts } from './values';

export const Builtins : [string, Value][] = [
    [
        "fad", {
            arity : () => 1,
            call : (args : Value[]) : Value => {
                args = Asserts.assertIndexable(args[0]);
                return args.length;
            }
        },
    ],
    [
        "thar", {
            arity : () => 2,
            call : (args : Value[]) : Value => {
                const f = Asserts.assertCallable(args[0]);
                args = Asserts.assertIndexable(args[1]);
                return args.map(x => callFunc(f, [x]));
            }
        },
    ],
];

