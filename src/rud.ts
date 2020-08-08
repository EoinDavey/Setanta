import { Creatlach } from "./creatlach";
import { RuntimeError } from "./error";
import { goTéacs, ObjIntf, Value } from "./values";

export class Rud implements ObjIntf {
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
        if (ball !== undefined) {
            return ball;
        }
        const gníomh = this.creatlach.aimsighGníomh(s);
        if (gníomh) {
            return gníomh.bind(this);
        }
        throw new RuntimeError(`Níl aon ball de ${goTéacs(this)} le ainm ${s}`);
    }
    public setAttr(id: string, v: Value): void {
        this.baill.set(id, v);
    }
}

class TuisWrap implements ObjIntf {
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
    public setAttr() {
        throw new RuntimeError("Ní féidir leat tuismitheoir a athrú");
    }
}
