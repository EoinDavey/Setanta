#!/usr/bin/env node
import * as readline from "readline";
import * as Asserts from "./asserts";
import { syntaxErrString, RuntimeError } from "./error";
import { SyntaxErr, PosInfo, ParseResult, ASTKinds, Parser } from "./gen_parser";
import { Interpreter } from "./i10r";
import { goTéacs, Value } from "./values";
import { STOP } from "./consts";

import * as fs from "fs";

const [, , ...pargs] = process.argv;

const usage = `Úsáid: setanta [comhad foinseach]
Usage: setanta [source file]`;

function printError(r: RuntimeError, source: string) {
    if(r.start && r.end && r.end.line - r.start.line <= 3) {
        const sourceLines = source.split('\n');
        console.error(`Eisceacht: ${r.msg}`);
        for(let i = r.start.line; i <= r.end.line; i++)
            console.error(`Líne ${i}: ${sourceLines[i-1]}`);
    } else if(r.start && r.end) {
        console.error(`Suíomh [${r.start.line}:${r.start.offset} - ${r.end.line}:${r.end.offset}]: Eisceacht: ${r.msg}`);
    } else if(r.start) {
        console.error(`Líne ${r.start.line}:${r.start.offset} Eisceacht: ${r.msg}`);
    } else {
        console.error(`Eisceacht: ${r.msg}`);
    }
}

function getExternals(léighfn: () => Promise<string|null>): [string[], Value][] {
    return [
        [
            ["scríobh", "scriobh"], {
                ainm: "scríobh",
                arity : () => -1,
                call : async (args: Value[]): Promise<string|null> => {
                    console.log(...args.map(goTéacs));
                    return null;
                },
            },
        ],
        [
            ["ceist"], {
                ainm: "ceist",
                arity : () => 1,
                call : (args: Value[]): Promise<string|null> => {
                    process.stdout.write(Asserts.assertTéacs(args[0]));
                    return léighfn();
                },
            },
        ],
        [
            ["léigh_líne", "léigh_line", "léigh_líne", "leigh_line"], {
                ainm: "léigh_líne",
                arity : () => 0,
                call : (args: Value[]): Promise<Value> => {
                    return léighfn();
                },
            },
        ],
    ];
}

async function getFullInput(getLine: () => Promise<string|null>,
    continuance: () => Promise<string|null>): Promise<string|SyntaxErr> {
    let prev = "";
    while(true) {
        const inpFn = prev === "" ? getLine : continuance;
        const inp = (await inpFn()) + '\n';
        if(inp === null)
            continue;
        const line = prev + inp;
        const parser = new Parser(line);
        const res = parser.parse();
        if(res.err === null)
            return line;
        if(res.err.pos.overallPos !== line.length)
            return res.err;
        prev = line;
    }
}

async function repl() {
    const rl: readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const getLine = (): Promise<string|null> => {
        return new Promise((r) => {
            rl.question("᚛ ", (resp) => r(resp));
        });
    };
    const continuance = (): Promise<string|null> => {
        return new Promise((r) => rl.question("...", r));
    }
    const i = new Interpreter(getExternals(getLine));
    let soFar = "";
    let prevPos: PosInfo = {overallPos: 0, line: 1, offset: 0};
    while (true) {
        const input = await getFullInput(getLine, continuance);
        if(input instanceof SyntaxErr) {
            console.error(syntaxErrString(input));
            continue;
        }
        soFar += input;
        const parser = new Parser(soFar);
        parser.reset(prevPos);
        const res = parser.parse();

        // Ignore that mark is private, for now - TODO fix this in tsPEG
        // @ts-ignore
        prevPos = parser.mark();
        const ast = res.ast!;
        try {
            // This is an expression, we can print the result
            if (ast.stmts.length === 1 && ast.stmts[0].kind === ASTKinds.And) {
                    console.log(goTéacs(await ast.stmts[0].evalfn(i.global)));
                    continue;
            }
            await i.interpret(ast);
        } catch (err) {
            if (err instanceof RuntimeError) {
                printError(err, soFar);
            } else if (err !== STOP) {
                console.error(err);
            }
        }
    }
    rl.close();
}

async function runFile() {
    const inFile = fs.readFileSync(pargs[0], { encoding: "utf8" });
    const parser = new Parser(inFile);
    const res = parser.parse();
    if (res.err) {
        console.error(syntaxErrString(res.err));
        process.exitCode = 1;
        return;
    }
    const rl: readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal : false,
    });
    const it: AsyncIterableIterator<string> = rl[Symbol.asyncIterator]();
    const léigh = (): Promise<string|null> => {
        return it.next().then((next) => {
            if (next.done) {
                return null;
            }
            return next.value;
        });
    };
    const i = new Interpreter(getExternals(léigh));

    try {
        await i.interpret(res.ast!);
    } catch (err) {
        if (err instanceof RuntimeError) {
            printError(err, inFile);
            process.exitCode = 1;
        } else {
            throw err;
        }
    } finally {
        rl.close();
    }
}

// return true if we should exit
function parseCommands(): boolean {
    for(const arg of pargs) {
        if(arg.length >= 2 && arg.slice(0, 2) === "--") {
            const com = arg.slice(2, arg.length);
            if (com === "help" || com === "cabhair") {
                console.log(usage);
            } else {
                console.error(`Ní thuigtear an brat "${com}"`);
            }
            return true;
        }
    }
    return false;
}

function main(): Promise<void> {
    if(parseCommands())
        return Promise.resolve();
    if (pargs.length === 1) {
        return runFile();
    } else if (pargs.length === 0) {
        return repl();
    }
    console.error(usage);
    return Promise.resolve();
}

main().catch((err) => {
    console.error(err);
});
