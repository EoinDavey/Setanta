#!/usr/bin/env node
import * as readline from 'readline';
import { Interpreter } from './i10r';
import { RuntimeError } from './error';
import { Parser, ASTKinds } from './gen_parser';
import { Asserts, Value, goLitreacha } from './values';

import * as fs from 'fs';

const [,, ...args] = process.argv;

function getLine(rl : readline.Interface, ceist : string) : Promise<string> {
    return new Promise(resolve => {
        rl.question(ceist, resp => {
            resolve(resp);
        });
    });
}

function getExternals(ceistfn : (s : string) => Promise<string>) : [string[], Value][]{
    return [
        [
            ['scríobh', 'scriobh'], {
                ainm: 'scríobh',
                arity : () => -1,
                call : async (args : Value[]) : Promise<Value> => {
                    console.log(...args.map(goLitreacha));
                    return null;
                }
            },
        ],
        [
            ['ceist'], {
                ainm: 'ceist',
                arity : () => 1,
                call : (args : Value[]) : Promise<Value> => {
                    return ceistfn(Asserts.assertLitreacha(args[0]));
                }
            },
        ],
        [
            ['léigh_líne', 'léigh_line', 'léigh_líne', 'leigh_line'], {
                ainm: 'léigh_líne',
                arity : () => 0,
                call : (args : Value[]) : Promise<Value> => {
                    return ceistfn('');
                }
            },
        ],
    ];
}

async function repl(rl : readline.Interface) {
    const ceistFn = (s : string) => getLine(rl, s);
    const i = new Interpreter(getExternals(ceistFn));
    while(true){
        const res = await getLine(rl, 'λ: ');
        const parser = new Parser(res);
        const p = parser.parse();
        if(p.err){
            console.log(''+p.err);
            continue;
        }
        const ast = p.ast!;
        try {
            if(ast.stmts.length === 1 && ast.stmts[0].kind === ASTKinds.And){
                    console.log(goLitreacha(await i.evalExpr(ast.stmts[0])));
                continue;
            }
            await i.interpret(ast);
        } catch(err) {
            if(err instanceof RuntimeError)
                console.log(err.msg);
            else
                console.log(err);
        }
    }
}

async function runFile(rl : readline.Interface) {
    const inFile = fs.readFileSync(args[0], { encoding: 'utf8' });
    const parser = new Parser(inFile);
    const res = parser.parse();
    if(res.err){
        console.error(res.err);
        process.exitCode = 1;
        return;
    }

    const ceistFn = (s : string) => getLine(rl, s);
    const i = new Interpreter(getExternals(ceistFn));

    try {
        await i.interpret(res.ast!);
    } catch (err) {
        if(err instanceof RuntimeError){
            console.error(err);
            process.exitCode = 1;
        }else
            throw err;
    } finally {
        rl.close();
    }
}

async function main() {
    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    if(args.length > 0)
        runFile(rl);
    else{
        repl(rl);
    }
}

main();
