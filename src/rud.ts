import { Creatlach } from "./creatlach";
import { RuntimeError } from "./error";
import { ObjIntf, Value, repr } from "./values";

// Rud implements the logic for objects and object
// lookups.
export class Rud implements ObjIntf {
    public ainm: string;
    public readonly tuis: TuisWrap | null = null;
    private readonly creatlach: Creatlach;
    private readonly baill: Map<string, Value> = new Map();

    constructor(ainm: string, creatlach: Creatlach) {
        this.ainm = ainm;
        this.creatlach = creatlach;
        if (this.creatlach.tuismitheoir)
            this.tuis = new TuisWrap(this, this.creatlach.tuismitheoir);
    }

    // getAttr fetcher the attribute from the object with this name
    public getAttr(s: string): Value {
        // We first check if this is a runtime member of the object.
        const ball = this.baill.get(s);
        if (ball !== undefined)
            return ball;
        // Secondarily we check if it is a class action. If it is
        // we bind this object to it.
        const gníomh = this.creatlach.aimsighGníomh(s);
        if (gníomh !== null)
            return gníomh.bind(this);
        throw new RuntimeError(`Níl aon ball "${s}" de ${repr(this)}`);
    }

    public setAttr(id: string, v: Value): void {
        this.baill.set(id, v);
    }
}

// TuisWrap acts as an object implementation for `tuis`
// to be bound to in the scope.
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
        if (gníomh)
            return gníomh.bind(this.rud);
        throw new RuntimeError(`Níl aon ball "${s}" ag tuismitheoir de ${this.cr.ainm}`);
    }

    public setAttr() {
        throw new RuntimeError("Ní féidir leat tuismitheoir a athrú");
    }
}
