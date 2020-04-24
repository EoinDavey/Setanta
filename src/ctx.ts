import { Environment } from "./env";

export class Context {
    // We use single element arrays (tuples in TS) here to hold these values so that
    // they can be inherited from parent contexts by references, instead of by value
    // Another approach would be to wrap them in an object.
    // This is done to avoid the overhead of checking the whole parent chain, each child
    // just has a reference to the root contexts values
    private _stopped: [boolean] = [false];
    private _skipCnt: [number] = [0];
    public env: Environment;

    constructor(ctx?: Context) {
        if (ctx) {
            this.env = new Environment(ctx.env);
            this._stopped = ctx._stopped;
            this._skipCnt = ctx._skipCnt;
        } else {
            this.env = new Environment();
        }
    }
    public get skipCnt() {
        return this._skipCnt[0];
    }
    public set skipCnt(n: number) {
        this._skipCnt[0] = n;
    }

    public get stopped() {
        return this._stopped[0];
    }
    public stop() {
        this._stopped[0] = true;
    }
}
