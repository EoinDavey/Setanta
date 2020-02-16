import { Environment } from "./env";
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
    private env: Environment;
    private execFn: (body: Stmt[], env: Environment) => Promise<Value>;
    constructor(ainm: string, defn: Stmt[], args: string[], env: Environment,
                execFn: (body: Stmt[], env: Environment) => Promise<Value>) {
        this.ainm = ainm;
        this.defn = defn;
        this.args = args;
        this.env = env;
        this.execFn = execFn;
    }
    public bind(seo: Rud): Gníomh {
        const env = new Environment(this.env);
        env.define("seo", seo);
        if (seo.tuis) {
            env.define("tuis", seo.tuis);
        }
        return new GníomhImpl(this.ainm, this.defn, this.args, env, this.execFn);
    }
    public arity() {
        return this.args.length;
    }
    public call(args: Value[]): Promise<Value> {
        const env: Environment = new Environment(this.env);
        for (let i = 0; i < args.length; ++i) {
            env.define(this.args[i], args[i]);
        }
        return this.execFn(this.defn, env);
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
            return Promise.reject(new RuntimeError("COMPLETE FAILURE"));
        }
        return this.f(this.seo, args);
    }
    public bind(seo: Rud): Gníomh {
        return new GníomhWrap(this.ainm, this.ar, this.f, seo);
    }
}
