import { Environment } from "./env";

export class Context {
    private static stopped = false;
    private static skipCnt = 0;
    public env: Environment;

    // Returns a new context with an environment wrapping the previous
    public static from(c : Context): Context {
        return new Context(new Environment(c.env));
    }

    constructor(env: Environment) {
        this.env = env;
    }
}
