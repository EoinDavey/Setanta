import { globalBuiltinsFadaCombos } from "./builtins";
import { Value } from "./values";
import { Context, RootContext } from "./ctx";
import { Program } from "./gen_parser";
import { execStmts } from "./execs";
import { STOP } from "./consts";
import { Binder } from "./bind";

// The Interpreter class can be used to control the execution
// of a Setanta program
export class Interpreter {
    public global: RootContext;
    public binder: Binder;

    private pendingCnt = 0;
    private rejectFn: (e: Error) => void = () => undefined;
    private resolveFn: () => void = () => undefined;
    private execPromise: Promise<void> | undefined;

    constructor(tps = 30, externals?: (ctx: Context) => [string, Value][]) {
        this.global = new RootContext(1000 / tps);
        this.binder = new Binder();
        this.binder.enterScope();
        globalBuiltinsFadaCombos(this.global)
            .forEach(x => this.global.env.define(x[0], x[1]));
        if(externals)
            externals(this.global).forEach(ext =>
                this.global.env.define(ext[0], ext[1]));
    }

    // stop attempts to stop all active executions
    public stop(): void {
        this.global.stop();
    }

    // inject takes an execution function and inserts it into the ongoing execution
    // context
    public inject(p: () => Promise<void>): void {
        if(this.execPromise === undefined) {
            throw new Error("Ní féidir 'inject' a úsáid nuair nach bhfuil clár ar siúl.");
        }
        this.pendingCnt += 1;
        p().catch(err => {
                this.rejectFn(err);
            })
            .finally(() => {
                this.pendingCnt -= 1;

                if(this.pendingCnt === 0)
                    this.resolveFn();
            });
    }

    // interpret takes a Setanta AST and executes it,
    // it returns a Promise that is resolved when the
    // execution completes.
    // throws RuntimeErr | StaticErr
    public async interpret(p: Program, stopOnErr = true): Promise<void> {
        if(this.execPromise !== undefined) {
            throw new Error("Ní féidir clár nua a thosaigh: Tá clár eile ag rith cheana.");
            return;
        }
        this.execPromise = new Promise((res, rej) => {
            this.resolveFn = res;
            this.rejectFn = stopOnErr
                ? (err) => { this.stop(); rej(err); }
                : rej;
        });

        try {
            const resolvedAst = this.binder.visitProgram(p);
            const rootPromise = () => execStmts(resolvedAst.stmts, this.global);
            this.inject(rootPromise);

            await this.execPromise;
        } catch(e) {
            if(e !== STOP)
                throw e;
        } finally {
            this.execPromise = undefined;
        }
    }

    // TODO Add function for executing Expr nodes directly and returning Values
}
