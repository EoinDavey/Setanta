import { Value } from './values';
import { undefinedError } from './error';

export class Environment {
    private enclosing : Environment | null;
    private values : Map<string, Value> = new Map();

    static from(arr : ArrayLike<[string, Value]>) : Environment {
        const v = new Environment();
        for(let i = 0; i < arr.length; ++i) {
            v.define(arr[i][0], arr[i][1]);
        }
        return v;
    }

    constructor(enc? : Environment) {
        this.enclosing = enc || null;
    }

    get(id : string) : Value {
        if(this.values.has(id))
            return this.values.get(id)!;
        if(this.enclosing)
            return this.enclosing.get(id);
        throw undefinedError(id);
    }

    assign(id : string, val : Value) {
        if(this.values.has(id)) {
            this.values.set(id, val);
            return;
        }

        if(this.enclosing) {
            this.enclosing.assign(id, val);
        }
        throw undefinedError(id);
    }

    define(id : string, val : Value) {
        this.values.set(id, val);
    }
}
