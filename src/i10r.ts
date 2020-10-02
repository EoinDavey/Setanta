import { getGlobalBuiltins } from "./builtins";
import { Value } from "./values";
import { Context } from "./ctx";
import { Program } from "./gen_parser";
import { execStmts } from "./execs";
import { STOP } from "./consts";
import { Binder } from "./bind";

export class Interpreter {
    public global: Context;
    constructor(externals?: (ctx: Context) => [string[], Value][]) {
        this.global = new Context();
        getGlobalBuiltins(this.global)
            .forEach(x => this.global.env.define(x[0], x[1]));
        if (externals)
            externals(this.global).forEach(ext =>
                ext[0].forEach(a => this.global.env.define(a, ext[1])));
    }

    public stop(): void {
        this.global.stop();
    }

    public interpret(p: Program): Promise<void> {
        const binder = new Binder();
        binder.visitProgram(p);
        return execStmts(p.stmts, this.global)
            .catch((err) => {
                if (err === STOP) {
                    return;
                }
                return Promise.reject(err);
            });
    }
}
