import { RuntimeError } from "./error";
import { AsgnStmt, NonAsgnStmt } from "./gen_parser";

import * as Asserts from "./asserts";
import * as Checks from "./checks";

// This library contains type definitions and utility functions for Setanta Values

// Value defines what Values in Setanta are supported.
export type Value = number | boolean | Callable | null | Value[] | string | ObjIntf;

// PossibleResolution is a type for IDs that may not have been resolved yet.
export type PossibleResolution = { resolved: false } | Resolve<Resolution>;

// Resolution represents variable resolutions. Resolve variables have either a depth
// and offset or are global.
export type Resolution = { global: false, depth: number, offset: number } | { global: true };

// Trick to distribute over type union.
type Resolve<T> = T extends unknown ? T & { resolved: true } : never;

export type TypeCheck = (v: Value) => boolean;

// Stmt is a type to union Assigning statement and non assigning statements.
// These are only distinct concepts for the parser, after parsing we can ignore the
// difference.
export type Stmt = AsgnStmt | NonAsgnStmt;

export type Comparable = number | boolean | string;

// A ref is a reference for assignment. A reference is a function that accepts a value.
// reference functions return functions that will perform the assignment.
export type Ref = (v: Value) => void;

export interface Callable {
    ainm: string;
    arity: () => number;
    call: (args: Value[]) => Promise<Value>;
}

export type Obj = string | Value[] | ObjIntf;

export interface ObjIntf {
    ainm: string;
    getAttr: (id: string) => Value;
    setAttr: (id: string, v: Value) => void;
}

// callFunc takes a Callable value, and a list of arguments, and calls the function.
// This handles checking that the the number of args is correct for the given arity.
export function callFunc(x: Value, args: Value[]): Promise<Value> {
    Asserts.assertCallable(x);
    const ar = x.arity();
    if (ar !== -1 && args.length !== x.arity())
        throw new RuntimeError(`Teastaíonn ${ar} argóint ó ${repr(x)}, ach fuair sé ${args.length}`);
    return x.call(args);
}

// idxList takes a list of Values and the index.
export function idxList(ls: Value, idx: Value): Value {
    Asserts.assertIndexable(ls);
    Asserts.assertNumber(idx);
    const adjustedIdx = idx < 0 ? idx + ls.length : idx;
    if (adjustedIdx < 0 || adjustedIdx >= ls.length)
        throw new RuntimeError(`Tá ${repr(idx)} thar teorainn an liosta`);
    return ls[adjustedIdx];
}

export class ObjIntfWrap implements ObjIntf {
    public ainm: string;
    public attrs: Map<string, Value>;
    constructor(ainm: string, attrs: [string[], Value][]) {
        this.ainm = ainm;
        this.attrs = new Map();
        for (const attr of attrs) {
            for (const k of attr[0]) {
                this.attrs.set(k, attr[1]);
            }
        }
    }
    public getAttr(id: string): Value {
        return this.attrs.get(id) || null;
    }
    public setAttr(): void {
        throw new RuntimeError(`Ní feidir leat ${repr(this)} a athrú`);
    }
}

// goTéacs converts a value to a text representation.
export function goTéacs(v: Value): string {
    if (Checks.isTéacs(v))
        return v;
    if (Checks.isNumber(v))
        return v.toString();
    if (Checks.isBool(v))
        return v ? "fíor" : "bréag";
    if (v === null)
        return "neamhní";
    if (Checks.isLiosta(v))
        return `[${v.map(goTéacs).join(", ")}]`;
    if (Checks.isCallable(v))
        return `< gníomh ${v.ainm} >`;
    return `< rud ${v.ainm} >`;
}

// repr returns a representation of the given value
// TODO make this limit the total length, e.g. truncate long list to [1, 2, 3 ... ].
export function repr(v: Value): string {
    if (Checks.isTéacs(v))
        return '"' + v + '"';
    if (Checks.isLiosta(v))
        return `[${v.map(repr).join(", ")}]`;
    return goTéacs(v);
}
