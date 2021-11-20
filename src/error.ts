import { PosInfo, SyntaxErr } from "./gen_parser";
import { BrisException, CCException, STOP} from "./consts";

// StaticError wraps errors that are raised during static analysis
// of the program.
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

// RuntimeError wraps errors that are raised during execution
// of the program.
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

export function alreadyDefinedError(id: string, start?: PosInfo, end?: PosInfo): StaticError {
    return new StaticError(`Tá "${id}" sa scóip seo cheana féin`, start, end);
}

export function undefinedError(id: string, start?: PosInfo, end?: PosInfo): RuntimeError {
    return new RuntimeError(`Níl aon athróg "${id}"`, start, end);
}

// If this is a runtime error, tag it with the location information.
// Location info is used during printing.
export function tagErrorLoc(r: unknown, start: PosInfo, end: PosInfo): unknown {
    if(r instanceof RuntimeError && r.start === null && r.end === null) {
        r.start = start;
        r.end = end;
    }
    if(typeof r === "string" && [STOP, CCException, BrisException].includes(r))
        return r;
    return new Error(`Earráid anaitnid: ${r}`);
}

// Needs to be updated to match the correct regex from the grammar spec.
const whitespaceRegex = "'(?:\\s|>--(?:(?!--<).)*(--<|\\n|$))'";
const identifierRegex = "'[a-zA-Z_áéíóúÁÉÍÓÚ][a-zA-Z_áéíóúÁÉÍÓÚ0-9]*'";
const boolRegex = "'f[ií]or|br[eé]ag'";

// Format a nicer, more readable error string.
export function syntaxErrString(err: SyntaxErr): string {
    const literals = err.expmatches.map(x => x.kind === "RegexMatch" ? `'${x.literal}'` : "$EOF");
    // remove the whitespace regex match because it's confusing to be displayed
    const matches = literals.filter(x => x !== whitespaceRegex);

    // If we can complete a bracket expression with a ) we should recommend this
    if(matches.includes("'\\)'")) {
        return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le ")"`;
    }
    // If we can complete a bracket expression with a ] we should recommend this
    if(matches.includes("'\\]'")) {
        return `Eisceacht ar líne ${err.pos.line}: Suíomh ${err.pos.offset}: Ag súil le "]"`;
    }
    // If we can complete a bracket expression with a } we should recommend this
    if(matches.includes("'}'")) {
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
