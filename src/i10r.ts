import * as P from './parser';
import { ASTKinds } from './parser';
import { Value, isTrue, isCallable, isNumber, isBool, Callable } from './values';
import { RuntimeError, undefinedError } from './error';
import { Environment } from './env';

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

function assertNumber(x : Value, op : string) : number {
    if(typeof x === "number")
        return x;
    throw new RuntimeError(`Operands to ${op} must be numbers`);
}

function assertCallable(x : Value) : Callable {
    if(isCallable(x))
        return x;
    throw new RuntimeError(`${x} is not callable`);
}

function assertComparable(a : Value, b : Value) : [number | boolean, number | boolean] {
    if(isNumber(a) && isNumber(b) || (isBool(a) && isBool(b)))
        return [a,b];
    throw new RuntimeError(`${a} is not comparable to ${b}`);
}

export class Interpreter {
    env : Environment = new Environment();
    interpret(p : P.Program) {
        this.execStmts(p.stmts);
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
            case ASTKinds.LeStmt:
                this.execLeStmt(st);
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
    execLeStmt(n : P.LeStmt) {
        const prev = this.env;
        this.env = new Environment(this.env);

        const strt = assertNumber(this.evalExpr(n.strt), '"le idir" loop');
        const end = assertNumber(this.evalExpr(n.end), '"le idir" loop');

        for(let i = strt; i < end; ++i) {
            this.env.define(n.id.id, i);
            this.execStmt(n.stmt);
        }

        this.env = prev;
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
            let yv = this.evalSum(y.trm);
            [x, yv] = assertComparable(x, yv);
            if(y.op === '>=')
                return x >= yv;
            if(y.op === '<=')
                return x <= yv;
            if(y.op === '<')
                return x < yv;
            return x > yv;
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
            const at = assertNumber(this.evalPostOp(y.trm), y.op);
            x = assertNumber(x, y.op);
            if(y.op === '*')
                return x*at;
            if(y.op === '/') {
                if(at === 0)
                    throw new RuntimeError("Division by zero");
                return x/at;
            }
            return x%at;
        }, this.evalPostOp(p.head));
    }
    evalPostOp(p : P.PostOp) : Value { // Call function
        return p.ops.reduce((x : Value, y) => {
            x = assertCallable(x);
            const args : Value[] = y.args ? this.evalCSArgs(y.args) : [];
            const ar = x.arity();
            if(args.length !== ar)
                throw new RuntimeError(`Function ${x} expected ${ar}, but got ${args.length}`);
            return x.call(args);
        }, this.evalAtom(p.at));
    }
    evalAtom(at : P.Atom) : Value {
        switch(at.kind){
            case ASTKinds.Int:
                return this.evalInt(at);
            case ASTKinds.Bool:
                return this.evalBool(at);
            case ASTKinds.ID:
                return this.evalID(at);
        }
        return this.evalExpr(at.trm);
    }
    evalCSArgs(args : P.CSArgs) : Value[] {
        return [this.evalExpr(args.head)].concat(args.tail.map(x => this.evalExpr(x.exp)));
    }
    evalID(id : P.ID) : Value {
        return this.env.get(id.id);
    }
    evalBool(b : P.Bool) : boolean {
        return /f[ií]or/.test(b.bool);
    }
    evalInt(i : P.Int) : number {
        return parseInt(i.int);
    }
}
