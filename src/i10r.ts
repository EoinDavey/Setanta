import { GlobalBuiltins } from "./builtins";
import { Environment } from "./env";
import { Value } from "./values";
import { Context } from "./ctx";
import { Program } from "./gen_parser";
import { execStmts, STOP } from "./execs";

export class Interpreter {
    public global: Context;
    constructor(externals?: [string[], Value][]) {
        const globalEnv = Environment.from(GlobalBuiltins);
        if (externals) {
            for (const ext of externals) {
                for (const a of ext[0]) {
                    globalEnv.define(a, ext[1]);
                }
            }
        }
        this.global = new Context();
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

