import { Environment } from "./env";
import { STOPType, STOP } from "./consts";

export class Context {
    // We use single element arrays (tuples in TS) here to hold these values so that
    // they can be inherited from parent contexts by references, instead of by value
    // Another approach would be to wrap them in an object.
    // This is done to avoid the overhead of checking the whole parent chain, each child
    // just has a reference to the root contexts values
    private _stopped: [boolean];
    private _skipCnt: [number];
    // A pool of promise rejection functions to be called when the interpreter is stopped
    // e.g. Outstanding setTimeout calls.
    // Use string literal type to ensure only can be called with STOP exception
    private _rejectPool: [Set<(s: STOPType)=>void>];
    public env: Environment;

    constructor(ctx?: Context) {
        if (ctx) {
            this.env = new Environment(ctx.env);
            this._stopped = ctx._stopped;
            this._skipCnt = ctx._skipCnt;
            this._rejectPool = ctx._rejectPool;
        } else {
            this.env = new Environment();
            this._stopped = [false];
            this._skipCnt = [0];
            this._rejectPool = [new Set()];
        }
    }
    public get skipCnt(): number {
        return this._skipCnt[0];
    }
    public set skipCnt(n: number) {
        this._skipCnt[0] = n;
    }

    public get stopped(): boolean {
        return this._stopped[0];
    }
    public stop(): void {
        this._stopped[0] = true;
        for(const fn of this.rejectPool) {
            fn(STOP);
        }
        this.rejectPool.clear();
    }

    public get rejectPool(): Set<(s: STOPType) => void> {
        return this._rejectPool[0];
    }
    public addRejectFn(fn: (s: STOPType) => void): void {
        this._rejectPool[0].add(fn);
    }
    public removeRejectFn(fn: (s: STOPType) => void): void {
        this._rejectPool[0].delete(fn);
    }
}
