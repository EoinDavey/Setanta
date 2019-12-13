import { Value, Asserts } from './values';

export const Builtins : [[string, Value]] = [
    [
        "fad", {
            arity : () => 1,
            call : (args : Value[]) : Value => {
                args = Asserts.assertIndexable(args[0])
                return args.length;
            }
        },
    ],
];

