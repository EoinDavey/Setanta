export class RuntimeError extends Error {
    public msg: string;
    constructor(message: string) {
        const msg = `Runtime Error: ${message}`;
        super(msg);
        this.msg = msg;
    }
}

export function undefinedError(id: string): RuntimeError {
    return new RuntimeError(`Undefined identifier: ${id}`);
}
