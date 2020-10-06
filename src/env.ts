import { undefinedError } from "./error";
import { Value } from "./values";

function getEnvAtDepth(env: Environment, depth: number): Environment | null {
    for(let i = 0; i < depth; ++i){
        if(env.enclosing === null)
            return env.enclosing;
        env = env.enclosing;
    }
    return env;
}

export class Environment {

    public static from(arr: [string, Value][]): Environment {
        const v = new Environment();
        for (const x of arr)
            v.define(x[0], x[1], true);
        return v;
    }

    private readonly slowGlobals: Map<string, Value>;
    public readonly enclosing: Environment | null;
    private readonly values: Map<string, Value> = new Map();
    private testList: Value[] = [];

    constructor(enc?: Environment) {
        this.enclosing = enc || null;
        this.slowGlobals = enc?.slowGlobals ?? new Map();
    }

    public has(id: string): boolean {
        return this.values.has(id);
    }

    public getValDirect(id: string): Value {
        const lookup = this.values.get(id);
        if (lookup === undefined)
            throw undefinedError(id);
        return lookup;
    }

    public getAtDepth(id: string, depth: number, idx: number): Value {
        const env = getEnvAtDepth(this, depth);
        if(env === null)
            throw undefinedError(id);
        const val = env.values.get(id);
        const test = idx === -1 ? env.slowGlobals.get(id) : env.testList[idx];
        if(val === undefined)
            throw undefinedError(id);
        if(test !== val)
            throw new Error(`fugd ${test} !== ${val}`);
        return val;
    }

    public assignAtDepth(id: string, depth: number, idx: number, val: Value): void {
        const env = getEnvAtDepth(this, depth);
        if(env === null)
            throw undefinedError(id);
        if(!env.has(id))
            throw undefinedError(id);
        if(idx === -1)
            env.slowGlobals.set(id, val);
        else
            env.testList[idx] = val;
        env.values.set(id, val);
    }

    // if anonGlobal is true, define ID into the un-resolved global space
    public define(id: string, val: Value, anonGlobal = false): void {
        if(anonGlobal) {
            this.slowGlobals.set(id, val);
        } else {
            this.testList.push(val);
        }
        this.values.set(id, val);
    }
}
