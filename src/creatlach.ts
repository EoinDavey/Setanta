import { Gníomh } from "./gniomh";
import { Rud } from "./rud";
import { Callable, Value, callFunc } from "./values";

// Interface for classes
export interface Creatlach extends Callable {
    tuismitheoir: Creatlach | null;
    aimsighGníomh(s: string): Gníomh | null;
}

// Implementation of a creatlach (class).
export class CreatlachImpl implements Creatlach {
    // Name of the class
    public ainm: string;
    // Parent class to inherit from
    public tuismitheoir: Creatlach | null;
    // Class actions
    protected gníomhaiochtaí: Map<string, Gníomh>;
    // Constructor
    protected constr: Gníomh | null;

    constructor(ainm: string, g: Map<string, Gníomh>, tuis?: Creatlach) {
        this.ainm = ainm;
        this.gníomhaiochtaí = g;
        this.tuismitheoir = tuis ?? null;
        this.constr = this.gníomhaiochtaí.get("nua") || null;
    }

    public arity(): number {
        return this.constr ? this.constr.arity() : 0;
    }

    public call(args: Value[]): Promise<Value> {
        const rud = new Rud(this.ainm, this);
        // If the constructor exists, call it, bound to `rud`.
        if (this.constr)
            return callFunc(this.constr.bind(rud), args)
                    .then(() => rud);
        return Promise.resolve(rud);
    }

    // Find an action by given name, looking into parent if it exists.
    public aimsighGníomh(s: string): Gníomh | null {
        const g = this.gníomhaiochtaí.get(s);
        if (g === undefined && this.tuismitheoir)
            return this.tuismitheoir.aimsighGníomh(s);
        return g ?? null;
    }
}
