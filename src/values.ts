import { ID, AsgnStmt, NonAsgnStmt } from './parser';
import { Environment } from './env';
import { Interpreter } from './i10r';

export type Value = number | boolean | Callable | null;

export type Stmt = AsgnStmt | NonAsgnStmt;

export function isTrue(v : Value) {
    return v !== 0 && v !== false;
}

export function isCallable(v : Value) : v is Callable {
    return !(v === null || typeof v === "number" || typeof v === "boolean");
}

export function isNumber(v : Value) : v is number {
    return typeof v === "number";
}

export function isBool(v : Value) : v is boolean {
    return typeof v === "boolean";
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
