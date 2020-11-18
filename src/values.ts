import { RuntimeError } from "./error";
import { AsgnStmt, NonAsgnStmt } from "./gen_parser";

import * as Asserts from "./asserts";
import * as Checks from "./checks";

export type Value = number | boolean | Callable | null | Value[] | string | ObjIntf;

// Trick to distribute over type union
type Resolve<T> = T extends unknown ? T & { resolved: true } : never;
export type PossibleResolution = { resolved: false } | Resolve<Resolution>;
export type Resolution = { global: false, depth: number, offset: number } | { global: true };

export type TypeCheck = (v: Value) => boolean;

export type Stmt = AsgnStmt | NonAsgnStmt;

export type Comparable = number | boolean;

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

export function callFunc(x: Value, args: Value[]): Promise<Value> {
    x = Asserts.assertCallable(x);
    const ar = x.arity();
    if (ar !== -1 && args.length !== x.arity()) {
        throw new RuntimeError(`Teastaíonn ${ar} argóint ó ${repr(x)}, ach fuair sé ${args.length}`);
    }
    return x.call(args);
}

export function idxList(x: Value, idx: Promise<Value>): Promise<Value> {
    const ls = Asserts.assertIndexable(x);
    return idx.then((v) => {
        v = Asserts.assertNumber(v);
        const adjustedIdx = v < 0 ? v + ls.length : v;
        if (adjustedIdx < 0 || adjustedIdx >= ls.length) {
            throw new RuntimeError(`Tá ${repr(v)} thar teorainn an liosta`);
        }
        return ls[adjustedIdx];
    });
}

// Quick index list, for use with quick evaluation strategies
export function qIdxList(x: Value, idx: Value): Value {
    const ls = Asserts.assertIndexable(x);
    const v = Asserts.assertNumber(idx);
    const adjustedIdx = v < 0 ? v + ls.length : v;
    if (adjustedIdx < 0 || adjustedIdx >= ls.length) {
        throw new RuntimeError(`Tá ${repr(v)} thar teorainn an liosta`);
    }
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

// goTéacs converts a value to a text representation
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
export function repr(v: Value): string {
    if (Checks.isTéacs(v))
        return '"' + v + '"';
    if (Checks.isLiosta(v))
        return `[${v.map(repr).join(", ")}]`;
    return goTéacs(v);
}
