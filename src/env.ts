import { undefinedError } from "./error";
import { Value } from "./values";

function getValAtDepth(env: Environment, id: string, depth: number): Value {
    for(let i = 0; i < depth; ++i){
        if(env.enclosing === null)
            throw undefinedError(id);
        env = env.enclosing;
    }
    const val = env.values.get(id);
    if(val === undefined)
        throw undefinedError(id);
    return val;
}

export class Environment {

    public static from(arr: [string, Value][]): Environment {
        const v = new Environment();
        for (const x of arr) {
            v.define(x[0], x[1]);
        }
        return v;
    }
    public enclosing: Environment | null;
    public values: Map<string, Value> = new Map();

    constructor(enc?: Environment) {
        this.enclosing = enc || null;
    }

    public has(id: string): boolean {
        return this.values.has(id);
    }

    public get(id: string): Value {
        const lookup = this.values.get(id);
        if (lookup !== undefined) {
            return lookup;
        }
        if (this.enclosing)
            return this.enclosing.get(id);
        throw undefinedError(id);
    }

    public getAtDepth(id: string, depth: number): Value {
        return getValAtDepth(this, id, depth);
    }

    public assign(id: string, val: Value): void {
        if (this.values.has(id)) {
            this.values.set(id, val);
            return;
        }
        if (this.enclosing) {
            this.enclosing.assign(id, val);
            return;
        }
        throw undefinedError(id);
    }

    public define(id: string, val: Value): void {
        this.values.set(id, val);
    }
}
