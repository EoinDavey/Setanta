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
    constructor(externals?: (ctx: Context) => [string, Value][]) {
        this.global = new RootContext();
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

    public inject(p: () => Promise<void>): void {
        if(this.execPromise === undefined)
            // TODO error
            return;
        this.pendingCnt += 1;
        p().catch(err => {
               if(err === STOP)
                   return;
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
    public async interpret(p: Program): Promise<void> {
        if(this.execPromise !== undefined) {
            // TODO error
            throw new Error("oop");
            return;
        }
        this.execPromise = new Promise((res, rej) => { this.resolveFn = res; this.rejectFn = rej; });

        try {
            const resolvedAst = this.binder.visitProgram(p);
            const rootPromise = () => execStmts(resolvedAst.stmts, this.global);
            this.inject(rootPromise);

            await this.execPromise;
        } finally {
            this.execPromise = undefined;
        }
    }

    // TODO Add function for executing Expr nodes directly and returning Values
}
