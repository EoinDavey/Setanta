import * as P from './parser';
import { ASTKinds } from './parser';
import { Value, isTrue } from './values';
import { RuntimeError, undefinedError } from './error';
import { Environment } from './env';

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

function assertNumber(x : Value, op : string) : number {
    if(typeof x === "number")
        return x;
    throw new RuntimeError(`Operands to ${op} must be numbers`);
}

export class Interpreter {
    env : Environment = new Environment();
    interpret(p : P.Program) {
        this.execStmts(p);
    }
    execStmts(stmts : Stmt[]){
        for(let st of stmts){
            this.execStmt(st);
        }
    }
    execStmtBlock(blk : P.BlockStmt) {
        const prev = this.env;
        this.env = new Environment(this.env);
        this.execStmts(blk.blk);
        this.env = prev;
    }
    execStmt(st : P.AsgnStmt | P.NonAsgnStmt) {
        switch(st.kind) {
            case ASTKinds.IfStmt:
                this.execMá(st);
                break
            case ASTKinds.BlockStmt:
                this.execStmtBlock(st);
                break;
            case ASTKinds.AssgnStmt:
                this.execAssgn(st);
                break;
            case ASTKinds.DefnStmt:
                this.execDefn(st);
                break;
            case ASTKinds.NuairStmt:
                this.execNuair(st);
                break;
            default:
                this.evalExpr(st);
                break;
        }
    }
    execNuair(n : P.NuairStmt) {
        while(isTrue(this.evalExpr(n.expr))){
            this.execStmt(n.stmt);
        }
    }
    execMá(f : P.IfStmt) {
        const v = this.evalExpr(f.expr);
        if(isTrue(v)){
            this.execStmt(f.stmt);
            return;
        }
        if(!f.elsebranch)
            return;
        this.execStmt(f.elsebranch.stmt);
    }
    execDefn(a : P.DefnStmt) {
        const val = this.evalExpr(a.expr);
        this.env.define(a.id.id, val);
    }
    execAssgn(a : P.AssgnStmt) {
        const val = this.evalExpr(a.expr);
        this.env.assign(a.id.id, val);
    }
    evalExpr(expr : P.Expr) : Value {
        return this.evalAnd(expr);
    }
    evalAnd(o : P.And) : Value {
        var head = this.evalOr(o.head);
        for(let x of o.tail){
            if(!head)
                break;
            head = head && this.evalOr(x.trm);
        }
        return head;
    }
    evalOr(o : P.Or) : Value {
        var head = this.evalEq(o.head);
        for(let x of o.tail){
            if(head)
                break;
            head = head || this.evalEq(x.trm);
        }
        return head;
    }
    evalEq(e : P.Eq) : Value {
        return e.tail.reduce((x, y) => {
            const at = this.evalComp(y.trm);
            if(y.op === '==')
                return x === at;
            return x !== at;
        }, this.evalComp(e.head));
    }
    evalComp(p : P.Comp) : Value {
        return p.tail.reduce((x, y) => {
            if(y.op === '>=')
                return x >= this.evalSum(y.trm);
            if(y.op === '<=')
                return x <= this.evalSum(y.trm);
            if(y.op === '<')
                return x < this.evalSum(y.trm);
            return x > this.evalSum(y.trm);
        }, this.evalSum(p.head));
    }
    evalSum(p : P.Sum) : Value {
        return p.tail.reduce((x, y) => {
            const at = assertNumber(this.evalProduct(y.trm), y.op);
            x = assertNumber(x, y.op);
            if(y.op === '+')
                return x+at;
            return x-at;
        }, this.evalProduct(p.head));
    }
    evalProduct(p : P.Product) : Value {
        return p.tail.reduce((x, y) => {
            const at = assertNumber(this.evalAtom(y.trm), y.op);
            x = assertNumber(x, y.op);
            if(y.op === '*')
                return x*at;
            if(y.op === '/') {
                if(at === 0)
                    throw new RuntimeError("Division by zero");
                return x/at;
            }
            return x%at;
        }, this.evalAtom(p.head));
    }
    evalAtom(at : P.Atom) : Value {
        if(at.kind === ASTKinds.Atom_1)
            return this.evalINT(at.trm);
        if(at.kind === ASTKinds.Atom_2)
            return this.evalID(at.trm);
        return this.evalExpr(at.trm);
    }
    evalID(id : P.ID) : Value {
        return this.env.get(id.id);
    }
    evalINT(i : P.INT) : number {
        return parseInt(i);
    }
}

export function evTest(s : string) {
    const p = new P.Parser(s);
    const result = p.parse();
    if(result.err != null){
        console.log('' + result.err);
        return;
    }
    const i10r = new Interpreter();
    console.log(i10r.interpret(result.ast!));
}
