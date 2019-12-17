#!/usr/bin/env node
import * as readline from 'readline';
import { Interpreter } from './i10r';
import { RuntimeError } from './error';
import { Parser, ASTKinds } from './gen_parser';
import { Asserts, Value, goLitreacha } from './values';

import * as fs from 'fs';

const [,, ...args] = process.argv;

function getExternals(léighfn : () => Promise<string|null>) : [string[], Value][]{
    return [
        [
            ['scríobh', 'scriobh'], {
                ainm: 'scríobh',
                arity : () => -1,
                call : async (args : Value[]) : Promise<string|null> => {
                    console.log(...args.map(goLitreacha));
                    return null;
                }
            },
        ],
        [
            ['ceist'], {
                ainm: 'ceist',
                arity : () => 1,
                call : (args : Value[]) : Promise<string|null> => {
                    process.stdout.write(Asserts.assertLitreacha(args[0]));
                    return léighfn();
                }
            },
        ],
        [
            ['léigh_líne', 'léigh_line', 'léigh_líne', 'leigh_line'], {
                ainm: 'léigh_líne',
                arity : () => 0,
                call : (args : Value[]) : Promise<Value> => {
                    return léighfn();
                }
            },
        ],
    ];
}

async function repl() {
    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const getLine = () : Promise<string|null> => {
        return new Promise(r => {
            rl.question('λ: ', resp => r(resp));
        });
    }
    const i = new Interpreter(getExternals(getLine));
    while(true){
        const res = await getLine();
        if(!res)
            break;
        const parser = new Parser(res as string);
        const p = parser.parse();
        if(p.err){
            console.log(''+p.err);
            continue;
        }
        const ast = p.ast!;
        try {
            if(ast.stmts.length === 1 && ast.stmts[0].kind === ASTKinds.And){
                    console.log(goLitreacha(await i.evalExpr(ast.stmts[0], i.global)));
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

async function runFile() {
    const inFile = fs.readFileSync(args[0], { encoding: 'utf8' });
    const parser = new Parser(inFile);
    const res = parser.parse();
    if(res.err){
        console.error(res.err);
        process.exitCode = 1;
        return;
    }
    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal : false
    });
    const it : AsyncIterableIterator<string> = rl[Symbol.asyncIterator]();
    const léigh = () : Promise<string|null> => { 
        return it.next().then(res => {
            if(res.done)
                return null;
            return res.value;
        });
    }
    const i = new Interpreter(getExternals(léigh));

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
    if(args.length > 0) {
        runFile();
    } else{
        repl();
    }
}

main();
