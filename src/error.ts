import { PosInfo } from "./gen_parser";
export class RuntimeError extends Error {
    public msg: string;
    public start: PosInfo | null;
    public end: PosInfo | null;
    constructor(message: string, start?: PosInfo, end?: PosInfo) {
        super(message);
        this.msg = message;
        this.start = start || null;
        this.end = end || null;
    }
    public toString(): string {
        return `Eisceacht: ${this.msg}`;
    }
}

export function undefinedError(id: string): RuntimeError {
    return new RuntimeError(`Níl aon athróg le ainm: ${id}`);
}

export function tagErrorLoc(r: Error, start: PosInfo, end: PosInfo): Error {
    if(r instanceof RuntimeError && r.start === null && r.end === null) {
        r.start = start;
        r.end = end;
    }
    return r;
}
