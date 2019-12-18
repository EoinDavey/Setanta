import { ID, AsgnStmt, NonAsgnStmt } from './gen_parser';
import { Environment } from './env';
import { Interpreter } from './i10r';
import { RuntimeError } from './error';

export type Value = number | boolean | Callable | null | ValLs | string | Obj;
interface ValLs extends Array<Value> {}

export type TypeCheck = (v : Value) => boolean

export type Stmt = AsgnStmt | NonAsgnStmt;

export type Comparable = number | boolean;

export namespace Checks {
    export function isTrue(v : Value) {
        return v !== 0 && v !== false && v !== null;
    }

    export function isEqual(a : Value, b : Value) : boolean {
        if(isLiosta(a) && isLiosta(b) && a.length === b.length)
            return a.map((x,i) => [x, b[i]]).every(x => isEqual(x[0],x[1]));
        return a === b;
    }

    export function isCallable(v : Value) : v is Callable {
        return !(v === null || isNumber(v) || isBool(v) || isLitreacha(v) || isLiosta(v)) && 'call' in v;
    }

    export function isObj(v : Value) : v is Obj {
        return !(v === null || isNumber(v) || isBool(v) || isLitreacha(v) || isLiosta(v)) && 'getAttr' in v;
    }

    export function isNumber(v : Value) : v is number {
        return typeof v === "number";
    }

    export function isBool(v : Value) : v is boolean {
        return typeof v === "boolean";
    }

    export function isLitreacha(v : Value) : v is string {
        return typeof v === "string";
    }

    export function isComparable(v : Value) : v is Comparable {
        return isBool(v) || isNumber(v) || isLitreacha(v);
    }

    export function isLiosta(v : Value) : v is ValLs {
        return Array.isArray(v);
    }
}

export namespace Asserts {
    export function assertNumber(x : Value) : number {
        if(Checks.isNumber(x))
            return x;
        throw new RuntimeError(`${x} is not number`);
    }

    export function assertLiosta(x : Value) : Value[] {
        if(Checks.isLiosta(x))
            return x;
        throw new RuntimeError(`${x} is not a list`);
    }

    export function assertLitreacha(x : Value) : string {
        if(Checks.isLitreacha(x))
            return x;
        throw new RuntimeError(`${x} is not a string`);
    }

    export function assertCallable(x : Value) : Callable {
        if(Checks.isCallable(x))
            return x;
        throw new RuntimeError(`${x} is not callable`);
    }

    export function assertObj(x : Value) : Obj {
        if(Checks.isObj(x))
            return x;
        throw new RuntimeError(`${x} is not callable`);
    }

    export function assertComparable(a : Value) : Comparable {
        if(Checks.isComparable(a))
            return a;
        throw new RuntimeError(`${a} is not comparable`);
    }

    export function assertIndexable(a : Value) : ArrayLike<Value> {
        if(Checks.isLiosta(a) || Checks.isLitreacha(a))
            return a;
        throw new RuntimeError(`${a} is not indexable`);
    }
}

export interface Callable {
    ainm : string;
    arity : () => number;
    call: (args : Value[]) => Promise<Value>;
}

export interface Obj {
    ainm: string;
    getAttr: (id : string) => Value;
}

export function callFunc(x : Value, args : Value[]) : Promise<Value> {
    x = Asserts.assertCallable(x);
    const ar = x.arity();
    if(ar !== -1 && args.length !== x.arity())
        throw new RuntimeError(`Function ${x} expected ${ar}, but got ${args.length}`);
    return x.call(args);
}

export class Gníomh implements Callable {
    ainm : string;
    defn : Stmt[];
    args : string[];
    env : Environment;
    execFn : (body : Stmt[], env : Environment) => Promise<Value>;
    constructor(ainm : string, defn : Stmt[], args : string[], env : Environment, execFn : (body : Stmt[], env : Environment) => Promise<Value>){
        this.ainm = ainm;
        this.defn = defn;
        this.args = args;
        this.env = env;
        this.execFn = execFn;
    }
    arity() {
        return this.args.length;
    }
    call(args : Value[]) : Promise<Value> {
        const env : Environment = new Environment(this.env);
        for(let i = 0; i < args.length; ++i)
            env.define(this.args[i], args[i]);
        return this.execFn(this.defn, env);
    }
}

export function goLitreacha(v : Value) : string {
    if(Checks.isLitreacha(v))
        return `'${v}'`;
    if(Checks.isNumber(v))
        return v.toString();
    if(Checks.isBool(v))
        return v ? 'fíor' : 'breag';
    if(v === null)
        return 'neamhní';
    if(Checks.isLiosta(v))
        return `[${v.map(goLitreacha).join(',')}]`;
    if(Checks.isCallable(v))
        return `< gníomh ${v.ainm} >`;
    return `< obj ${v.ainm} >`;
}
