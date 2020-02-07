import { Environment } from "./env";
import { Rud } from "./rud";
import { Callable, Stmt, Value } from "./values";

export class Gníomh implements Callable {
    public ainm: string;
    public defn: Stmt[];
    public args: string[];
    public env: Environment;
    public execFn: (body: Stmt[], env: Environment) => Promise<Value>;
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
        return new Gníomh(this.ainm, this.defn, this.args, env, this.execFn);
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
