#!/usr/bin/env node
import * as readline from 'readline';
import { Interpreter } from './i10r';
import { RuntimeError } from './error';
import { Parser, ASTKinds } from './parser';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getLine() : Promise<string> {
    return new Promise(resolve => {
        rl.question('λ: ', resp => {
            resolve(resp);
        });
    });
}

async function main() {
    const i = new Interpreter();
    while(true){
        const res = await getLine();
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

main();
