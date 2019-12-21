import { Creatlach } from "./creatlach";
import { Obj, Value } from "./values";

export class Rud implements Obj {
    public ainm: string;
    private creatlach: Creatlach;
    private baill: Map<string, Value> = new Map();
    constructor(ainm: string, creatlach: Creatlach) {
        this.ainm = ainm;
        this.creatlach = creatlach;
    }
    public getAttr(s: string): Value {
        const ball = this.baill.get(s);
        if (ball) {
            return ball;
        }
        const gníomh = this.creatlach.aimsighGníomh(s);
        if (gníomh) {
            return gníomh;
        }
        return null;
    }
}
