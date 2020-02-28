import { undefinedError } from "./error";
import { Value } from "./values";

export class Environment {

    public static from(arr: Array<[string, Value]>): Environment {
        const v = new Environment();
        for (const x of arr) {
            v.define(x[0], x[1]);
        }
        return v;
    }
    private enclosing: Environment | null;
    private values: Map<string, Value> = new Map();

    constructor(enc?: Environment) {
        this.enclosing = enc || null;
    }

    public has(id: string): boolean {
        return this.values.has(id);
    }

    public get(id: string): Value {
        if (this.values.has(id)) {
            return this.values.get(id)!;
        }
        if (this.enclosing) {
            return this.enclosing.get(id);
        }
        throw undefinedError(id);
    }

    public assign(id: string, val: Value) {
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

    public define(id: string, val: Value) {
        this.values.set(id, val);
    }
}
