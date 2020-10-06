import { PosInfo, SyntaxErr } from "./gen_parser";

// Start identical to RuntimeError
export class StaticError extends Error {
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

// Needs to be updated to match the correct regex from the grammar spec.
const whitespaceRegex = "(?:\\s|>--(?:(?!--<).)*(--<|\\n|$))";
const identifierRegex = "[a-zA-Z_áéíóúÁÉÍÓÚ][a-zA-Z_áéíóúÁÉÍÓÚ0-9]*";
const boolRegex = "f[ií]or|br[eé]ag";

export function syntaxErrString(err: SyntaxErr): string {
    // remove the whitespace regex match because it's confusing to be displayed
    const matches = err.expmatches.filter(x => x !== whitespaceRegex);

    // If we can complete a bracket expression with a ) we should recommend this
    if(matches.includes("\\)")) {
        return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le ")"`;
    }
    // If we can complete a bracket expression with a ] we should recommend this
    if(matches.includes("\\]")) {
        return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le "]"`;
    }
    // If we can complete a bracket expression with a } we should recommend this
    if(matches.includes("}")) {
        return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le "}"`;
    }

    // We use booleans to indicate that any expression can be placed here, as expressions
    // can be used iff bools can (could also use string literals etc.)
    if(matches.includes(boolRegex)) {
        return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le uimhir, téacs, bool, athróg, liosta, nó gníomh.`;
    }

    if(matches.includes(identifierRegex)) { // We can use an identifier here
        return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le ainm`;
    }

    return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le ceann de: ${matches}`;
}
