import * as P from './parser';
import { ASTKinds } from './parser';
import { Value, isTrue } from './values';
import { RuntimeError, undefinedError } from './error';
import { Environment } from './env';

// TODO Division by zero
export class Interpreter {
    env : Environment = new Environment();
    interpret(p : P.Program) {
        this.execStmts(p);
    }
    execStmts(stmts : P.Stmt[]){
        for(let st of stmts){
            this.execStmt(st);
        }
    }
    execStmtBlock(blk : P.Stmt[]) {
        const prev = this.env;
        this.env = new Environment(this.env);
        this.execStmts(blk);
        this.env = prev;
    }
    execStmt(st : P.Stmt) {
        if(st.kind === ASTKinds.Stmt_1) {
            this.execIf(st.ifst);
        }else if(st.kind === ASTKinds.Stmt_2) {
            this.execAssgn(st.asgn);
        }else if(st.kind === ASTKinds.Stmt_3) {
            this.execDefn(st.asgn);
        } else {
            this.evalExpr(st.expr);
        }
    }
    execIf(f : P.IfStmt) {
        const v = this.evalExpr(f.expr);
        if(isTrue(v)){
            this.execStmtBlock(f.seq);
            return;
        }
        if(!f.elsebranch)
            return;
        this.execStmtBlock(f.elsebranch.seq);
    }
    execDefn(a : P.DefnStmt) {
        const val = this.evalExpr(a.expr);
        this.env.define(a.id, val);
    }
    execAssgn(a : P.AssgnStmt) {
        const val = this.evalExpr(a.expr);
        this.env.assign(a.id, val);
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
            const at = this.evalProduct(y.trm);
            if(!(typeof at === "number" && typeof x === "number"))
                throw new RuntimeError("Operands must be numbers");
            if(y.op === '+')
                return x+at;
            return x-at;
        }, this.evalProduct(p.head));
    }
    evalProduct(p : P.Product) : Value {
        return p.tail.reduce((x, y) => {
            const at = this.evalAtom(y.trm);
            if(!(typeof at === "number" && typeof x === "number"))
                throw new RuntimeError("Operands must be numbers");
            if(y.op === '*')
                return x*at;
            if(y.op === '/')
                return x/at;
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
        return this.env.get(id);
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
