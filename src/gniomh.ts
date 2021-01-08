import { Context } from "./ctx";
import { RuntimeError } from "./error";
import { Rud } from "./rud";
import { Callable, Stmt, Value } from "./values";
import { Toradh, execStmts } from "./execs";
import { BrisException } from "./consts";
import { ID } from "./gen_parser";

export interface Gníomh extends Callable {
    bind(seo: Rud): Gníomh;
}

// GníomhImpl implements a class for Gníomhs.
export class GníomhImpl implements Callable {
    public ainm: string;
    private defn: Stmt[];
    private args: ID[];
    private ctx: Context;

    constructor(ainm: string, defn: Stmt[], args: ID[], ctx: Context) {
        this.ainm = ainm;
        this.defn = defn;
        this.args = args;
        this.ctx = ctx;
    }

    // bind returns a new Gníomh with "seo" and "tuis" bound
    // to the supplied object and the objects parent class.
    public bind(seo: Rud): Gníomh {
        const ctx = new Context(this.ctx);
        ctx.env.define("seo", seo);
        if (seo.tuis)
            ctx.env.define("tuis", seo.tuis);
        return new GníomhImpl(this.ainm, this.defn, this.args,
            ctx);
    }

    public arity(): number {
        return this.args.length;
    }

    public call(args: Value[]): Promise<Value> {
        const ctx: Context = new Context(this.ctx);
        // args.length === this.args.length here is checked before call
        for (let i = 0; i < args.length; ++i)
            ctx.env.define(this.args[i].id, args[i]);
        return execStmts(this.defn, ctx)
            .then(() => null)
            .catch(e => {
                // This catch block is important as it catches
                // Toradh exceptions, which contain the result.
                if (e instanceof Toradh)
                    return e.luach;
                if (e !== BrisException)
                    return Promise.reject(e);
                return null;
            });
    }
}

// GníomhWrap is used to wrap a function that supports being bound.
// Currently used for testing.
export class GníomhWrap implements Gníomh {
    public readonly ainm: string;
    private readonly ar: number;
    private readonly f: (seo: Rud, args: Value[]) => Promise<Value>;
    private readonly seo: Rud | null;

    constructor(ainm: string, arity: number, f: (seo: Rud, args: Value[]) => Promise<Value>, seo?: Rud) {
        this.ainm = ainm;
        this.ar = arity;
        this.f = f;
        this.seo = seo ?? null;
    }

    public arity(): number { return this.ar; }

    public call(args: Value[]): Promise<Value> {
        if (this.seo === null) // Really really should not happen
            return Promise.reject(new RuntimeError("COMPLETE FAILURE"));
        return this.f(this.seo, args);
    }

    public bind(seo: Rud): Gníomh {
        return new GníomhWrap(this.ainm, this.ar, this.f, seo);
    }
}
