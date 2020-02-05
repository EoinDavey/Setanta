#!/usr/bin/env node
import * as readline from "readline";
import * as Asserts from "./asserts";
import { RuntimeError } from "./error";
import { ASTKinds, Parser } from "./gen_parser";
import { Interpreter } from "./i10r";
import { goLitreacha, Value } from "./values";

import * as fs from "fs";

const [, , ...pargs] = process.argv;

function getExternals(léighfn: () => Promise<string|null>): Array<[string[], Value]> {
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
    const i = new Interpreter(getExternals(getLine));
    while (true) {
        const res = await getLine();
        if (!res) {
            continue;
        }
        const parser = new Parser(res as string);
        const p = parser.parse();
        if (p.err) {
            console.log("" + p.err);
            continue;
        }
        const ast = p.ast!;
        try {
            if (ast.stmts.length === 1 && ast.stmts[0].kind === ASTKinds.And) {
                    console.log(goLitreacha(await ast.stmts[0].evalfn(i.global)));
                    continue;
            }
            await i.interpret(ast);
        } catch (err) {
            if (err instanceof RuntimeError) {
                console.log(err.msg);
            } else {
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
            console.error(err);
            process.exitCode = 1;
        } else {
            throw err;
        }
    } finally {
        rl.close();
    }
}

function main() {
    if (pargs.length > 0) {
        runFile();
    } else {
        repl();
    }
}

main();
