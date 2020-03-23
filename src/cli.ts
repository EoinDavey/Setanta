#!/usr/bin/env node
import * as readline from "readline";
import * as Asserts from "./asserts";
import { RuntimeError } from "./error";
import { ParseResult, ASTKinds, Parser } from "./gen_parser";
import { Interpreter, STOP } from "./i10r";
import { goLitreacha, Value } from "./values";

import * as fs from "fs";

const [, , ...pargs] = process.argv;

function getExternals(léighfn: () => Promise<string|null>): [string[], Value][] {
    return [
        [
            ["scríobh", "scriobh"], {
                ainm: "scríobh",
                arity : () => -1,
                call : async (args: Value[]): Promise<string|null> => {
                    console.log(...args.map(goLitreacha));
                    return null;
                },
            },
        ],
        [
            ["ceist"], {
                ainm: "ceist",
                arity : () => 1,
                call : (args: Value[]): Promise<string|null> => {
                    process.stdout.write(Asserts.assertLitreacha(args[0]));
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

async function getAst(getLine: () => Promise<string|null>,
    continuance: () => Promise<string|null>): Promise<ParseResult> {
    let prev = "";
    while(true) {
        const inpFn = prev === "" ? getLine : continuance;
        const inp = await inpFn();
        if(inp === null)
            continue;
        const line = prev + inp;
        const parser = new Parser(line);
        const res = parser.parse();
        if(res.err === null)
            return res;
        if(res.err.pos.offset !== line.length)
            return res;
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
    while (true) {
        const p = await getAst(getLine, continuance);
        if (p.err) {
            console.log("" + p.err);
            continue;
        }
        const ast = p.ast!;
        try {
            // This is an expression, we can print the result
            if (ast.stmts.length === 1 && ast.stmts[0].kind === ASTKinds.And) {
                    console.log(goLitreacha(await ast.stmts[0].evalfn(i.global)));
                    continue;
            }
            await i.interpret(ast);
        } catch (err) {
            if (err instanceof RuntimeError) {
                console.log(err.msg);
            } else if (err !== STOP) {
                console.log(err);
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
        console.error(res.err);
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
            console.error(err.msg);
            process.exitCode = 1;
        } else {
            throw err;
        }
    } finally {
        rl.close();
    }
}

function main(): Promise<void> {
    if (pargs.length > 0) {
        return runFile();
    }
    return repl();
}

main().catch((err) => {
    console.error(err);
});
