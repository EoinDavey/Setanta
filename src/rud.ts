import { Creatlach } from "./creatlach";
import { RuntimeError } from "./error";
import { Callable, goLitreacha, Obj, Value } from "./values";

export class Rud implements Obj {
    public ainm: string;
    public readonly tuis: TuisWrap | null = null;
    private creatlach: Creatlach;
    private baill: Map<string, Value> = new Map();
    constructor(ainm: string, creatlach: Creatlach) {
        this.ainm = ainm;
        this.creatlach = creatlach;
        if (this.creatlach.tuismitheoir) {
            this.tuis = new TuisWrap(this, this.creatlach.tuismitheoir);
        }
    }
    public getAttr(s: string): Value {
        const ball = this.baill.get(s);
        if (ball) {
            return ball;
        }
        const gníomh = this.creatlach.aimsighGníomh(s);
        if (gníomh) {
            if (this.tuis) {
                return gníomh.bind(this);
            }
            return gníomh.bind(this);
        }
        throw new RuntimeError(`Níl aon ball de ${goLitreacha(this)} le ainm ${s}`);
    }
    public setAttr(id: string, v: Value) {
        this.baill.set(id, v);
    }
}

class TuisWrap implements Obj {
    public readonly ainm: string = "tuis";
    private rud: Rud;
    private cr: Creatlach;
    constructor(rud: Rud, cr: Creatlach) {
        this.rud = rud;
        this.cr = cr;
    }
    public getAttr(s: string): Value {
        const gníomh = this.cr.aimsighGníomh(s);
        if (gníomh) {
            return gníomh.bind(this.rud);
        }
        throw new RuntimeError(`Níl aon ball le ainm ${s} ag tuismitheoir de ${this.cr.ainm}`);
    }
    public setAttr(id: string, v: Value) {
        throw new RuntimeError("Ní feidir leat tuismitheoir a athrú");
    }
}
