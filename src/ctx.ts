import { Environment } from "./env";
import { SKIP_COUNT_LIM, STOP, STOPType } from "./consts";

// The Context classes represent the execution context of a specific execution
// Context wraps the current lexical scope Environment and handles skip count and stopping
// logic.
export interface Context {
    skipCnt: number;
    stopped: boolean;
    env: Environment;

    wrapped(): Context;

    stop(): void;
    yieldExec(ex: () => Promise<void>): Promise<void>;

    addRejectFn(fn: (s: STOPType) => void): void;
    removeRejectFn(fn: (s: STOPType) => void): void;

}

abstract class ContextBase {
    // We use single element arrays (tuples in TS) here to hold these values so that
    // they can be inherited from parent contexts by references, instead of by value
    // Another approach would be to wrap them in an object.
    // This is done to avoid the overhead of checking the whole parent chain, each child
    // just has a reference to the root contexts values
    protected abstract _stopped: [boolean];
    protected abstract _skipCnt: [number];

    // A pool of promise rejection functions to be called when the interpreter is stopped
    // e.g. Outstanding setTimeout calls.
    // Use string literal type to ensure only can be called with STOP exception
    protected abstract _rejectPool: [Set<(s: STOPType)=>void>];

    public abstract env: Environment;

    public wrapped(): Context {
        return new WrappedContext(this.env, this._stopped, this._skipCnt,
            this._rejectPool);
    }

    public yieldExec(ex: () => Promise<void>): Promise<void> {
        if(this.stopped)
            return Promise.reject(STOP);

        if(this.skipCnt >= SKIP_COUNT_LIM) {
            this.skipCnt = 0;
            return new Promise(r => { setTimeout(r); }).then(ex);
        }
        return ex();
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
        for(const fn of this.rejectPool)
            fn(STOP);
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

export class RootContext extends ContextBase implements Context {
    protected _stopped: [boolean];
    protected _skipCnt: [number];
    protected _rejectPool: [Set<(s: STOPType)=>void>];
    public env: Environment;


    constructor() {
        super();
        this.env = new Environment();
        this._stopped = [false];
        this._skipCnt = [0];
        this._rejectPool = [new Set()];
    }
}

export class WrappedContext extends ContextBase implements Context {
    protected _stopped: [boolean];
    protected _skipCnt: [number];
    protected _rejectPool: [Set<(s: STOPType)=>void>];
    public env: Environment;

    constructor(env: Environment, stopped: [boolean], skipCnt: [number],
      rejectPool: [Set<(s: STOPType)=>void>]) {
        super();
        this.env = new Environment(env);
        this._stopped = stopped;
        this._skipCnt = skipCnt;
        this._rejectPool = rejectPool;
    }
}
