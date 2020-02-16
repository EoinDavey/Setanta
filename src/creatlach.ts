import { Gníomh } from "./gniomh";
import { Rud } from "./rud";
import { Callable, callFunc, Value } from "./values";

export interface Creatlach extends Callable {
    tuismitheoir: Creatlach | null;
    aimsighGníomh(s: string): Gníomh | null;
}

export class CreatlachImpl implements Creatlach {
    public ainm: string;
    public tuismitheoir: Creatlach | null;
    protected gníomhaiochtaí: Map<string, Gníomh>;
    protected constr: Gníomh | null;
    constructor(ainm: string, g: Map<string, Gníomh>, tuis?: Creatlach) {
        this.ainm = ainm;
        this.gníomhaiochtaí = g;
        this.tuismitheoir = tuis || null;
        this.constr = this.gníomhaiochtaí.get("nua") || null;
    }
    public arity(): number {
        return this.constr ? this.constr.arity() : 0;
    }
    public call(args: Value[]): Promise<Value> {
        const rud = new Rud(this.ainm, this);
        if (this.constr) {
            return callFunc(this.constr.bind(rud), args).then(() => rud);
        }
        return Promise.resolve(rud);
    }
    public aimsighGníomh(s: string): Gníomh | null {
        const g = this.gníomhaiochtaí.get(s);
        if (!g && this.tuismitheoir) {
            return this.tuismitheoir.aimsighGníomh(s);
        }
        return g || null;
    }
}
