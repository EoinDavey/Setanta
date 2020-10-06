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
            v.define(x[0], x[1]);
        return v;
    }

    public readonly enclosing: Environment | null;
    private readonly values: Map<string, Value> = new Map();
    private testList: (Value | undefined)[] = [];

    constructor(enc?: Environment) {
        this.enclosing = enc || null;
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

    public getAtDepth(id: string, depth: number): Value {
        const env = getEnvAtDepth(this, depth);
        if(env === null)
            throw undefinedError(id);
        const val = env.values.get(id);
        if(val === undefined)
            throw undefinedError(id);
        return val;
    }

    public assignAtDepth(id: string, depth: number, val: Value): void {
        const env = getEnvAtDepth(this, depth);
        if(env === null)
            throw undefinedError(id);
        if(!env.has(id))
            throw undefinedError(id);
        env.values.set(id, val);
    }

    public define(id: string, val: Value): void {
        this.values.set(id, val);
    }
}
