import { Environment } from "./env";
import { Context } from "./ctx";
import { RuntimeError } from "./error";
import { Rud } from "./rud";
import { Callable, Stmt, Value } from "./values";

export interface Gníomh extends Callable {
    bind(seo: Rud): Gníomh;
}

export class GníomhImpl implements Callable {
    public ainm: string;
    private defn: Stmt[];
    private args: string[];
    private ctx: Context;
    private execFn: (body: Stmt[], ctx: Context) => Promise<Value>;
    constructor(ainm: string, defn: Stmt[], args: string[], ctx: Context,
                execFn: (body: Stmt[], ctx: Context) => Promise<Value>) {
        this.ainm = ainm;
        this.defn = defn;
        this.args = args;
        this.ctx = ctx;
        this.execFn = execFn;
    }
    public bind(seo: Rud): Gníomh {
        const env = new Environment(this.ctx.env);
        env.define("seo", seo);
        if (seo.tuis) {
            env.define("tuis", seo.tuis);
        }
        return new GníomhImpl(this.ainm, this.defn, this.args,
            new Context(env), this.execFn);
    }
    public arity() {
        return this.args.length;
    }
    public call(args: Value[]): Promise<Value> {
        const ctx: Context = Context.from(this.ctx);
        for (let i = 0; i < args.length; ++i) {
            ctx.env.define(this.args[i], args[i]);
        }
        return this.execFn(this.defn, ctx);
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
    public arity() { return this.ar; }
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
