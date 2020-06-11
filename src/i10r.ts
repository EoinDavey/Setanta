import { getGlobalBuiltins } from "./builtins";
import { Environment } from "./env";
import { Value } from "./values";
import { Context } from "./ctx";
import { Program } from "./gen_parser";
import { execStmts } from "./execs";
import { STOP } from "./consts";

export class Interpreter {
    public global: Context;
    constructor(externals?: [string[], Value][]) {
        this.global = new Context();
        const globalEnv = Environment.from(getGlobalBuiltins(this.global));
        if (externals) {
            for (const ext of externals) {
                for (const a of ext[0]) {
                    globalEnv.define(a, ext[1]);
                }
            }
        }
        this.global.env = globalEnv;
    }
    public stop() {
        this.global.stop();
    }
    public interpret(p: Program): Promise<void> {
        return execStmts(p.stmts, this.global)
        .catch((err) => {
            if (err === STOP) {
                return;
            }
            return Promise.reject(err);
        });
    }
}
