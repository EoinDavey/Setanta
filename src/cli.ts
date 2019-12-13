#!/usr/bin/env node
import * as readline from 'readline';
import { Interpreter } from './i10r';
import { RuntimeError } from './error';
import { Parser, ASTKinds } from './parser';
import { Value } from './values';

import * as fs from 'fs';

const [,, ...args] = process.argv;

function getLine(rl : readline.Interface) : Promise<string> {
    return new Promise(resolve => {
        rl.question('λ: ', resp => {
            resolve(resp);
        });
    });
}

const externals : [[string, Value]] = [
    [
        "scríobh", {
            arity : () => 1,
            call : (args : Value[]) : Value => {
                console.log(...args);
                return null;
            }
        },
    ],
];

async function repl(rl : readline.Interface) {
    const i = new Interpreter(externals);
    while(true){
        const res = await getLine(rl);
        const parser = new Parser(res);
        const p = parser.parse();
        if(p.err){
            console.log(''+p.err);
            continue;
        }
        const ast = p.ast!;
        try {
            if(ast.stmts.length === 1 && ast.stmts[0].kind === ASTKinds.And){
                    console.log(i.evalExpr(ast.stmts[0]));
                continue;
            }
            i.interpret(ast);
        } catch(err){
            if(err instanceof RuntimeError)
                console.log(err.msg);
            else
                console.log(err);
        }
    }
}

async function runFile() {
    const i = new Interpreter(externals);
    const inFile = fs.readFileSync(args[0], { encoding: 'utf8' });
    const parser = new Parser(inFile);
    const res = parser.parse();
    if(res.err){
        console.error(res.err);
        return;
    }
    i.interpret(res.ast!);
}

async function main() {
    if(args.length > 0)
        runFile();
    else{
        const rl : readline.Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        repl(rl);
    }
}

main();
