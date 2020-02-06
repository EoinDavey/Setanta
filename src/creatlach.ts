import { Gníomh } from "./gniomh";
import { Rud } from "./rud";
import { Callable, callFunc, Value } from "./values";

export class Creatlach implements Callable {
    public ainm: string;
    protected gníomhaiochtaí: Map<string, Gníomh>;
    protected constr: Gníomh | null;
    private tuismitheoir: Creatlach | null;
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
            callFunc(this.constr.bind(rud), args);
        }
        return Promise.resolve(rud);
    }
    public aimsighGníomh(s: string): Gníomh|null {
        const g = this.gníomhaiochtaí.get(s);
        if (!g && this.tuismitheoir) {
            return this.tuismitheoir.aimsighGníomh(s);
        }
        return g || null;
    }
}
