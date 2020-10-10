import { undefinedError } from "./error";
import { Resolution, Value } from "./values";

function getEnvAtDepth(env: Environment, depth: number): Environment | null {
    for(let i = 0; i < depth; ++i){
        if(env.enclosing === null)
            return env.enclosing;
        env = env.enclosing;
    }
    return env;
}

// Environment contains the current values for the in-scope variables
// Environments are recursive, each contains a reference to it's parent
// environment (enclosing scope) if it exists. (It only doesn't exist for
// the global environment.
export class Environment {

    public static from(arr: [string, Value][]): Environment {
        const v = new Environment();
        for (const x of arr)
            v.define(x[0], x[1]);
        return v;
    }

    // Enclosing environment
    public readonly enclosing: Environment | null;
    // globals contains the collection of global variables
    private readonly globals: Map<string, Value>;
    // values contains the current values for each variable
    // the mapping of variable name to array index is computed
    // during the variable resolution stage, and stored on the
    // AST.
    private readonly values: Value[] = [];

    constructor(enc?: Environment) {
        this.enclosing = enc || null;
        // If we have no enclosing environment, we are
        // the outermost environment, so we construct
        // the globals
        this.globals = enc?.globals ?? new Map();
    }

    public getGlobalValDirect(id: string): Value {
        return this.getGlobal(id);
    }

    public get(id: string, res: Resolution): Value {
        return res.global
            ? this.getGlobal(id)
            : this.getAtDepth(id, res.depth, res.offset);
    }

    public assign(id: string, res: Resolution, val: Value): void {
        if(res.global)
            this.assignGlobal(id, val);
        else
            this.assignAtDepth(id, res.depth, res.offset, val);
    }

    public define(id: string, val: Value): void {
        // We are global scope
        if(this.enclosing === null) {
            this.globals.set(id, val);
        } else {
            this.values.push(val);
        }
    }

    private getAtDepth(id: string, depth: number, idx: number): Value {
        const env = getEnvAtDepth(this, depth);
        if(env === null)
            throw undefinedError(id);
        if(idx < 0 || idx >= env.values.length)
            throw undefinedError(id);
        const val = env.values[idx];
        if(val === undefined)
            throw undefinedError(id);
        return val;
    }

    private getGlobal(id: string): Value {
        const val = this.globals.get(id);
        if(val === undefined)
            throw undefinedError(id);
        return val;
    }

    private assignAtDepth(id: string, depth: number, idx: number, val: Value): void {
        const env = getEnvAtDepth(this, depth);
        if(env === null)
            throw undefinedError(id);
        if(idx < 0 || idx >= env.values.length)
            throw undefinedError(id);
        env.values[idx] = val;
    }

    private assignGlobal(id: string, val: Value): void {
        this.globals.set(id, val);
    }
}
