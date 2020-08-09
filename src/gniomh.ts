import { Context } from "./ctx";
import { RuntimeError } from "./error";
import { Rud } from "./rud";
import { Callable, Stmt, Value } from "./values";
import { Toradh, execStmts } from "./execs";
import { BrisException } from "./consts";

export interface Gníomh extends Callable {
    bind(seo: Rud): Gníomh;
}

export class GníomhImpl implements Callable {
    public ainm: string;
    private defn: Stmt[];
    private args: string[];
    private ctx: Context;
    constructor(ainm: string, defn: Stmt[], args: string[], ctx: Context) {
        this.ainm = ainm;
        this.defn = defn;
        this.args = args;
        this.ctx = ctx;
    }
    public bind(seo: Rud): Gníomh {
        const ctx = new Context(this.ctx);
        ctx.env.define("seo", seo);
        if (seo.tuis) {
            ctx.env.define("tuis", seo.tuis);
        }
        return new GníomhImpl(this.ainm, this.defn, this.args,
            ctx);
    }
    public arity(): number {
        return this.args.length;
    }
    public call(args: Value[]): Promise<Value> {
        const ctx: Context = new Context(this.ctx);
        for (let i = 0; i < args.length; ++i) {
            ctx.env.define(this.args[i], args[i]);
        }
        return execStmts(this.defn, ctx).then(() => null).catch((e) => {
            if (e instanceof Toradh) {
                return e.luach;
            }
            if (e !== BrisException) {
                return Promise.reject(e);
            }
            return null;
        });
    }
}

export class GníomhWrap implements Gníomh {
    public ainm: string;
    private readonly ar: number;
    private readonly f: (seo: Rud, args: Value[]) => Promise<Value>;
    private seo: Rud | null;
    constructor(ainm: string, arity: number, f: (seo: Rud, args: Value[]) => Promise<Value>, seo?: Rud) {
        this.ainm = ainm;
        this.ar = arity;
        this.f = f;
        this.seo = seo || null;
    }
    public arity(): number { return this.ar; }
    public call(args: Value[]): Promise<Value> {
        if (this.seo === null) {
            // Really really should not happen
            return Promise.reject(new RuntimeError("COMPLETE FAILURE"));
        }
        return this.f(this.seo, args);
    }
    public bind(seo: Rud): Gníomh {
        return new GníomhWrap(this.ainm, this.ar, this.f, seo);
    }
}
