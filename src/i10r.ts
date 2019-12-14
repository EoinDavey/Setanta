import * as P from './gen_parser';
import { ASTKinds } from './gen_parser';
import { unescapeChars, callFunc, Comparable, TypeCheck, Gníomh, Value, Checks, Callable, Asserts } from './values';
import { RuntimeError, undefinedError } from './error';
import { Environment } from './env';
import { Builtins } from './builtins';
import { repeat, cat } from './liosta';

type Stmt = P.AsgnStmt | P.NonAsgnStmt;

type BinOp = (a : Value, b : Value) => Value;

const BrisException = 'BREAK';
const CCException = 'CC';

class Toradh{
    luach: Value
    constructor(v : Value) {
        this.luach = v;
    }
}

interface binOpEntry { lcheck : TypeCheck, rcheck : TypeCheck, op : BinOp };

function makeBinOp<L extends Value, R extends Value>(lassert : (v : Value) => L,
    rassert : (v : Value) => R, op : (a : L, b : R) => Value) : BinOp {
        return (a : Value, b : Value) =>  { 
            return op(lassert(a), rassert(b));
        }
}

function numBinOpEntry(f : (a : number, b : number) => Value) : binOpEntry {
    return {
        lcheck : Checks.isNumber,
        rcheck: Checks.isNumber,
        op : makeBinOp(Asserts.assertNumber, Asserts.assertNumber, f)
    };
}

function compBinOpEntry(f : (a : Comparable, b : Comparable) => Value) : binOpEntry {
    return {
        lcheck : Checks.isComparable,
        rcheck: Checks.isComparable,
        op : makeBinOp(Asserts.assertComparable, Asserts.assertComparable, f)
    };
}

const binOpTable : Map<string, binOpEntry[]> = new Map([
    ['+', [
        numBinOpEntry((a, b) => a + b),
        {
            lcheck : Checks.isLiosta,
            rcheck : Checks.isLiosta,
            op : makeBinOp(Asserts.assertLiosta, Asserts.assertLiosta, cat)
        }
    ]],
    ['-', [numBinOpEntry((a, b) => a - b)]],
    ['*', [
        numBinOpEntry((a, b) => a * b),
        {
            lcheck : Checks.isLiosta,
            rcheck : Checks.isNumber,
            op : makeBinOp(Asserts.assertLiosta, Asserts.assertNumber, repeat)
        }
    ]],
    ['%', [numBinOpEntry((a, b) => a % b)]],
    ['/', [numBinOpEntry((a, b) => { 
                if(b == 0)
                    throw new RuntimeError(`Division by zero`);
                return a / b
        })]],
    ['<', [compBinOpEntry((a, b) => a < b)]],
    ['>', [compBinOpEntry((a, b) => a > b)]],
    ['<=', [compBinOpEntry((a, b) => a <= b)]],
    ['>=', [compBinOpEntry((a, b) => a >= b)]]
]);

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
        while(Checks.isTrue(this.evalExpr(n.expr))){
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

        const strt = Asserts.assertNumber(this.evalExpr(n.strt));
        const end = Asserts.assertNumber(this.evalExpr(n.end));

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
        if(Checks.isTrue(v)){
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
                    rt = callFunc(rt, op.args ? this.evalCSArgs(op.args) : []);
                } else {
                    rt = this.idxList(rt, op.expr);
                }
            }
            // Last operand must be array lookup
            const op = ops[ops.length-1];
            if(!('expr' in op))
                throw new RuntimeError(`Cannot assign to function call`);
            // Get array
            const arr = Asserts.assertLiosta(rt);
            const idx = Asserts.assertNumber(this.evalExpr(op.expr));
            if(idx < 0 || idx >= arr.length)
                throw new RuntimeError(`Index ${idx} out of bounds`);
            arr[idx] = val;
        } else {
            this.env.assign(a.id.id.id, val);
        }
    }
    evalBinOp(a : Value, b : Value, op : string) : Value {
        const g = binOpTable.get(op);
        if(g)
            for(let x of g)
                if(x.lcheck(a) && x.rcheck(b))
                    return x.op(a, b);
        throw new RuntimeError(`Can't apply ${op} to ${a} and ${b}`);
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
            const eq = Checks.isEqual(x, at);
            return y.op === '==' ? eq : !eq;
        }, this.evalComp(e.head));
    }
    evalComp(p : P.Comp) : Value {
        return p.tail.reduce((x, y) => {
            return this.evalBinOp(x, this.evalSum(y.trm), y.op);
        }, this.evalSum(p.head));
    }
    evalSum(p : P.Sum) : Value {
        return p.tail.reduce((x, y) => this.evalBinOp(x, this.evalProduct(y.trm), y.op),
            this.evalProduct(p.head));
    }
    evalProduct(p : P.Product) : Value {
        return p.tail.reduce((x, y) => this.evalBinOp(x, this.evalPrefix(y.trm), y.op),
            this.evalPrefix(p.head));
    }
    evalPostfix(p : P.Postfix) : Value {
        return p.ops.reduce((x : Value, y) => {
            if('args' in y)
                return callFunc(x, y.args ? this.evalCSArgs(y.args) : []);
            return this.idxList(x, y.expr);
        }, this.evalAtom(p.at));
    }
    evalPrefix(p : P.Prefix) : Value {
        const pf = this.evalPostfix(p.pf);
        if(p.op === '-')
            return -Asserts.assertNumber(pf);
        if(p.op === '!')
            return !Checks.isTrue(pf);
        return pf;
    }
    idxList(x : Value, idx : P.Expr) : Value {
        const ls = Asserts.assertIndexable(x);
        const v = Asserts.assertNumber(this.evalExpr(idx));
        if(v < 0 || v >= ls.length)
            throw new RuntimeError(`Index ${v} out of bounds`);
        return ls[v];
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
            case ASTKinds.Litreacha:
                return this.evalLitreacha(at);
            case ASTKinds.Neamhni:
                return null;
        }
        return this.evalExpr(at.trm);
    }
    evalLitreacha(ls : P.Litreacha) : Value {
        return unescapeChars(ls.val);
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
