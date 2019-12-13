import * as P from './parser';
import { ASTKinds } from './parser';
import { Gníomh, Value, isEqual, isTrue, Callable, Asserts } from './values';
import { RuntimeError, undefinedError } from './error';
import { Environment } from './env';
import { Builtins } from './builtins';

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

const BrisException = 'BREAK';
const CCException = 'CC';

class Toradh{
    luach: Value
    constructor(v : Value) {
        this.luach = v;
    }
}

export class Interpreter {
    env : Environment = new Environment();
    constructor(externals? : ArrayLike<[string, Value]>){
        this.env = Environment.from(Builtins);
        if(externals)
            for(let i = 0; i < externals.length; ++i)
                this.env.define(externals[i][0], externals[i][1]);
    }
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
        try {
            this.execStmts(blk.blk);
        } finally {
            this.env = prev;
        }
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
            case ASTKinds.GniomhStmt:
                this.execGniomhStmt(st);
                break;
            case ASTKinds.ToradhStmt:
                this.execToradhStmt(st);
                break;
            case ASTKinds.CCStmt:
                this.execCCStmt(st);
                break;
            case ASTKinds.BrisStmt:
                this.execBrisStmt(st);
                break;
            default:
                this.evalExpr(st);
                break;
        }
    }
    execCCStmt(b : P.CCStmt) {
        throw CCException;
    }
    execBrisStmt(b : P.BrisStmt) {
        throw BrisException;
    }
    execToradhStmt(b : P.ToradhStmt) {
        throw new Toradh(b.exp ? this.evalExpr(b.exp) : null);
    }
    execGniomhStmt(fn : P.GniomhStmt){
        const execFn = (body : Stmt[], env : Environment) : Value => {
            const prev = this.env;
            this.env = env;
            try {
                this.execStmts(body);
            } catch(e) {
                if(e instanceof Toradh)
                    return e.luach;
                if(e !== BrisException)
                    throw e;
            } finally {
                this.env = prev;
            }
            return null;
        }
        const args = fn.args ? this.evalCSIDs(fn.args) : [];
        const gníomh = new Gníomh(fn.stmts, args, this.env, execFn);
        this.env.define(fn.id.id, gníomh);
    }
    execNuair(n : P.NuairStmt) {
        while(isTrue(this.evalExpr(n.expr))){
            try {
                this.execStmt(n.stmt);
            } catch(e) {
                if(e === BrisException)
                    break;
                if(e === CCException)
                    continue;
                throw e;
            }
        }
    }
    execLeStmt(n : P.LeStmt) {
        const prev = this.env;
        this.env = new Environment(this.env);

        const strt = Asserts.assertNumber(this.evalExpr(n.strt), '"le idir" loop');
        const end = Asserts.assertNumber(this.evalExpr(n.end), '"le idir" loop');

        try {
            for(let i = strt; i < end; ++i) {
                this.env.define(n.id.id, i);
                try {
                    this.execStmt(n.stmt);
                } catch(e) {
                    if(e === BrisException)
                        break;
                    if(e === CCException)
                        continue;
                    throw e;
                }
            }
        } finally {
            this.env = prev;
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
        if(a.id.ops.length){
            let rt : Value = this.evalID(a.id.id);
            const ops = a.id.ops;
            // Eval all but last postfix operand
            for(let i = 0; i < ops.length-1; ++i){
                const op = ops[i];
                if('args' in op){
                    rt = this.callFunc(rt, op.args ? this.evalCSArgs(op.args) : []);
                } else {
                    rt = this.idxList(rt, op.expr);
                }
            }
            // Last operand must be array lookup
            const op = ops[ops.length-1];
            if(!('expr' in op))
                throw new RuntimeError(`Cannot assign to function call`);
            // Get array
            const arr = Asserts.assertIndexable(rt);
            const idx = Asserts.assertNumber(this.evalExpr(op.expr),"[]");
            if(idx < 0 || idx >= arr.length)
                throw new RuntimeError(`Index ${idx} out of bounds`);
            arr[idx] = val;
        } else {
            this.env.assign(a.id.id.id, val);
        }
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
                return isEqual(x, at);
            return !isEqual(x, at);
        }, this.evalComp(e.head));
    }
    evalComp(p : P.Comp) : Value {
        return p.tail.reduce((x, y) => {
            let yv = this.evalSum(y.trm);
            [x, yv] = Asserts.assertComparable(x, yv);
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
            const at = Asserts.assertNumber(this.evalProduct(y.trm), y.op);
            x = Asserts.assertNumber(x, y.op);
            if(y.op === '+')
                return x+at;
            return x-at;
        }, this.evalProduct(p.head));
    }
    evalProduct(p : P.Product) : Value {
        return p.tail.reduce((x, y) => {
            const at = Asserts.assertNumber(this.evalPostfix(y.trm), y.op);
            x = Asserts.assertNumber(x, y.op);
            if(y.op === '*')
                return x*at;
            if(y.op === '/') {
                if(at === 0)
                    throw new RuntimeError("Division by zero");
                return x/at;
            }
            return x%at;
        }, this.evalPostfix(p.head));
    }
    evalPostfix(p : P.Postfix) : Value {
        return p.ops.reduce((x : Value, y) => {
            if('args' in y)
                return this.callFunc(x, y.args ? this.evalCSArgs(y.args) : []);
            return this.idxList(x, y.expr);
        }, this.evalAtom(p.at));
    }
    idxList(x : Value, idx : P.Expr) : Value {
        x = Asserts.assertIndexable(x);
        const v = Asserts.assertNumber(this.evalExpr(idx), "[]");
        if(v < 0 || v >= x.length)
            throw new RuntimeError(`Index ${v} out of bounds`);
        return x[v];
    }
    callFunc(x : Value, args : Value[]){
        x = Asserts.assertCallable(x);
        const ar = x.arity();
        if(args.length !== x.arity())
            throw new RuntimeError(`Function ${x} expected ${ar}, but got ${args.length}`);
        return x.call(args);
    }
    evalAtom(at : P.Atom) : Value {
        switch(at.kind){
            case ASTKinds.Int:
                return this.evalInt(at);
            case ASTKinds.Bool:
                return this.evalBool(at);
            case ASTKinds.ID:
                return this.evalID(at);
            case ASTKinds.ListLit:
                return this.evalListLit(at);
            case ASTKinds.Neamhni:
                return null;
        }
        return this.evalExpr(at.trm);
    }
    evalListLit(ls : P.ListLit) : Value {
        return ls.els ? this.evalCSArgs(ls.els) : [];
    }
    evalCSArgs(args : P.CSArgs) : Value[] {
        return [this.evalExpr(args.head)].concat(args.tail.map(x => this.evalExpr(x.exp)));
    }
    evalCSIDs(ids : P.CSIDs) : string[] {
        return [ids.head.id].concat(ids.tail.map(x=>x.id.id));
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
