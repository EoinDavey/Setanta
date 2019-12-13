import { ID, AsgnStmt, NonAsgnStmt } from './parser';
import { Environment } from './env';
import { Interpreter } from './i10r';
import { RuntimeError } from './error';

export type Value = number | boolean | Callable | null | ValLs;
interface ValLs extends Array<Value> {}

export type Stmt = AsgnStmt | NonAsgnStmt;

export function isTrue(v : Value) {
    return v !== 0 && v !== false && v !== null;
}

export function isEqual(a : Value, b : Value) : boolean {
    if(isLiosta(a) && isLiosta(b) && a.length === b.length)
        return a.map((x,i) => [x, b[i]]).every(x => isEqual(x[0],x[1]));
    return a === b;
}

export function isCallable(v : Value) : v is Callable {
    return !(v === null || typeof v === "number" || typeof v === "boolean" || isLiosta(v));
}

export function isNumber(v : Value) : v is number {
    return typeof v === "number";
}

export function isBool(v : Value) : v is boolean {
    return typeof v === "boolean";
}

export function isLiosta(v : Value) : v is ValLs {
    return Array.isArray(v);
}

export namespace Asserts {
    export function assertNumber(x : Value, op : string) : number {
        if(isNumber(x))
            return x;
        throw new RuntimeError(`Operands to ${op} must be numbers`);
    }

    export function assertCallable(x : Value) : Callable {
        if(isCallable(x))
            return x;
        throw new RuntimeError(`${x} is not callable`);
    }

    export function assertComparable(a : Value, b : Value) : [number | boolean, number | boolean] {
        if(isNumber(a) && isNumber(b) || (isBool(a) && isBool(b)))
            return [a,b];
        throw new RuntimeError(`${a} is not comparable to ${b}`);
    }

    export function assertIndexable(a : Value) : Value[] {
        if(isLiosta(a))
            return a;
        throw new RuntimeError(`${a} is not indexable`);
    }
}

export interface Callable {
    arity : () => number;
    call: (args : Value[]) => Value;
}

export class Gníomh implements Callable {
    defn : Stmt[];
    args : string[];
    env : Environment;
    execFn : (body : Stmt[], env : Environment) => Value;
    constructor(defn : Stmt[], args : string[], env : Environment, execFn : (body : Stmt[], env : Environment)=>Value){
        this.defn = defn;
        this.args = args;
        this.env = env;
        this.execFn = execFn;
    }
    arity() {
        return this.args.length;
    }
    call(args : Value[]) : Value {
        const env : Environment = new Environment(this.env);
        for(let i = 0; i < args.length; ++i)
            env.define(this.args[i], args[i]);
        return this.execFn(this.defn, env);
    }
}
