import { getGlobalBuiltins } from "./builtins";
import { Value } from "./values";
import { Context } from "./ctx";
import { Program } from "./gen_parser";
import { execStmts } from "./execs";
import { STOP } from "./consts";
import { Binder } from "./bind";

export class Interpreter {
    public global: Context;
    public binder: Binder;
    constructor(externals?: (ctx: Context) => [string[], Value][]) {
        this.global = new Context();
        this.binder = new Binder();
        this.binder.enterScope();
        getGlobalBuiltins(this.global)
            .forEach(x => this.global.env.define(x[0], x[1]));
        if(externals)
            externals(this.global).forEach(ext =>
                ext[0].forEach(a => this.global.env.define(a, ext[1])));
    }

    public stop(): void {
        this.global.stop();
    }

    public interpret(p: Program): Promise<void> {
        const resolvedAst = this.binder.visitProgram(p);
        return execStmts(resolvedAst.stmts, this.global)
            .catch((err) => {
                if(err === STOP)
                    return;
                return Promise.reject(err);
            });
    }
}
