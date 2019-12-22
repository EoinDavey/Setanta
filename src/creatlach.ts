import { Gníomh } from "./gniomh";
import { Rud } from "./rud";
import { Callable, Value } from "./values";

export class Creatlach implements Callable {
    public ainm: string;
    protected gníomhaiochtaí: Map<string, Gníomh>;
    private tuismitheoir: Creatlach | null;
    constructor(ainm: string, g: Map<string, Gníomh>, tuis?: Creatlach) {
        this.ainm = ainm;
        this.gníomhaiochtaí = g;
        this.tuismitheoir = tuis || null;
    }
    public arity(): number {
        return 0;
    }
    public call(args: Value[]): Promise<Value> {
        const rud = new Rud(this.ainm, this);
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
