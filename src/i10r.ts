import * as P from './gen_parser';
import { ASTKinds } from './gen_parser';
import { callFunc, Comparable, TypeCheck, Gníomh, Value, Checks, Callable, Asserts } from './values';
import { RuntimeError, undefinedError } from './error';
import { Environment } from './env';
import { Builtins } from './builtins';
import { repeat, cat } from './liosta';
import { unescapeChars, strcat, strrep } from './litreacha';

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
        },
        {
            lcheck : Checks.isLitreacha,
            rcheck : Checks.isLitreacha,
            op : makeBinOp(Asserts.assertLitreacha, Asserts.assertLitreacha, strcat)
        }
    ]],
    ['-', [numBinOpEntry((a, b) => a - b)]],
    ['*', [
        numBinOpEntry((a, b) => a * b),
        {
            lcheck : Checks.isLiosta,
            rcheck : Checks.isNumber,
            op : makeBinOp(Asserts.assertLiosta, Asserts.assertNumber, repeat)
        },
        {
            lcheck : Checks.isLitreacha,
            rcheck : Checks.isNumber,
            op : makeBinOp(Asserts.assertLitreacha, Asserts.assertNumber, strrep)
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
    async interpret(p : P.Program) {
        await this.execStmts(p.stmts);
    }
    async execStmts(stmts : Stmt[]){
        for(let st of stmts){
            await this.execStmt(st);
        }
    }
    async execStmtBlock(blk : P.BlockStmt) {
       const prev = this.env;
        this.env = new Environment(this.env);
        try {
            await this.execStmts(blk.blk);
        } finally {
            this.env = prev;
        }
    }
    async execStmt(st : P.AsgnStmt | P.NonAsgnStmt) {
        switch(st.kind) {
            case ASTKinds.IfStmt:
                await this.execMá(st);
                break
            case ASTKinds.BlockStmt:
                await this.execStmtBlock(st);
                break;
            case ASTKinds.AssgnStmt:
                await this.execAssgn(st);
                break;
            case ASTKinds.DefnStmt:
                await this.execDefn(st);
                break;
            case ASTKinds.NuairStmt:
                await this.execNuair(st);
                break;
            case ASTKinds.LeStmt:
                await this.execLeStmt(st);
                break;
            case ASTKinds.GniomhStmt:
                await this.execGniomhStmt(st);
                break;
            case ASTKinds.ToradhStmt:
                await this.execToradhStmt(st);
                break;
            case ASTKinds.CCStmt:
                await this.execCCStmt(st);
                break;
            case ASTKinds.BrisStmt:
                await this.execBrisStmt(st);
                break;
            default:
                await this.evalExpr(st);
                break;
        }
    }
    execCCStmt(b : P.CCStmt) {
        throw CCException;
    }
    execBrisStmt(b : P.BrisStmt) {
        throw BrisException;
    }
    async execToradhStmt(b : P.ToradhStmt) {
        throw new Toradh(b.exp ? await this.evalExpr(b.exp) : null);
    }
    execGniomhStmt(fn : P.GniomhStmt){
        const execFn = async (body : Stmt[], env : Environment) : Promise<Value> => {
            const prev = this.env;
            this.env = env;
            try {
                await this.execStmts(body);
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
    async execNuair(n : P.NuairStmt) {
        while(Checks.isTrue(await this.evalExpr(n.expr))){
            try {
                await this.execStmt(n.stmt);
            } catch(e) {
                if(e === BrisException)
                    break;
                if(e === CCException)
                    continue;
                throw e;
            }
        }
    }
    async execLeStmt(n : P.LeStmt) {
        const prev = this.env;
        this.env = new Environment(this.env);

        const strt = Asserts.assertNumber(await this.evalExpr(n.strt));
        const end = Asserts.assertNumber(await this.evalExpr(n.end));

        try {
            for(let i = strt; i < end; ++i) {
                this.env.define(n.id.id, i);
                try {
                    await this.execStmt(n.stmt);
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
    async execMá(f : P.IfStmt) {
        const v = await this.evalExpr(f.expr);
        if(Checks.isTrue(v)){
            await this.execStmt(f.stmt);
            return;
        }
        if(!f.elsebranch)
            return;
        await this.execStmt(f.elsebranch.stmt);
    }
    async execDefn(a : P.DefnStmt) {
        const val = await this.evalExpr(a.expr);
        this.env.define(a.id.id, val);
    }
    async execAssgn(a : P.AssgnStmt) {
        const val = await this.evalExpr(a.expr);
        if(a.id.ops.length){
            let rt : Value = this.evalID(a.id.id);
            const ops = a.id.ops;
            // Eval all but last postfix operand
            for(let i = 0; i < ops.length-1; ++i){
                const op = ops[i];
                if('args' in op){
                    rt = await callFunc(rt, op.args ? await this.evalCSArgs(op.args) : []);
                } else {
                    rt = await this.idxList(rt, op.expr);
                }
            }
            // Last operand must be array lookup
            const op = ops[ops.length-1];
            if(!('expr' in op))
                throw new RuntimeError(`Cannot assign to function call`);
            // Get array
            const arr = Asserts.assertLiosta(rt);
            const idx = Asserts.assertNumber(await this.evalExpr(op.expr));
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

    evalExpr(expr : P.Expr) : Promise<Value> {
        return this.evalAnd(expr);
    }

    async evalAnd(o : P.And) : Promise<Value> {
        var head = await this.evalOr(o.head);
        for(let x of o.tail){
            if(!head)
                break;
            head = head && await this.evalOr(x.trm);
        }
        return head;
    }
    async evalOr(o : P.Or) : Promise<Value> {
        var head = await this.evalEq(o.head);
        for(let x of o.tail){
            if(head)
                break;
            head = head || await this.evalEq(x.trm);
        }
        return head;
    }
    async evalEq(e : P.Eq) : Promise<Value> {
        return e.tail.reduce(async (x : Promise<Value>, y : P.Eq_$0) : Promise<Value> => {
            const at = await this.evalComp(y.trm);
            const eq = Checks.isEqual(await x, at);
            return y.op === '==' ? eq : !eq;
        }, this.evalComp(e.head));
    }
    async evalComp(p : P.Comp) : Promise<Value> {
        return p.tail.reduce(async (x : Promise<Value>, y : P.Comp_$0) : Promise<Value> => {
            return this.evalBinOp(await x, await this.evalSum(y.trm), y.op);
        }, this.evalSum(p.head));
    }
    async evalSum(p : P.Sum) : Promise<Value> {
        return p.tail.reduce(async (x : Promise<Value>, y : P.Sum_$0) : Promise<Value> =>
            this.evalBinOp(await x, await this.evalProduct(y.trm), y.op), this.evalProduct(p.head));
    }
    async evalProduct(p : P.Product) : Promise<Value> {
        return p.tail.reduce(async (x : Promise<Value>, y : P.Product_$0) : Promise<Value> => {
            return this.evalBinOp(await x, await this.evalPrefix(y.trm), y.op)
        }, this.evalPrefix(p.head));
    }
    async evalPostfix(p : P.Postfix) : Promise<Value> {
        const v = async (x : Promise<Value>, y : P.PostOp) : Promise<Value> => {
            if('args' in y){
                return callFunc(await x, await (y.args ? await this.evalCSArgs(y.args) : []));
            }
            return await this.idxList(await x, y.expr);
        }
        return p.ops.reduce(v, this.evalAtom(p.at));
    }
    async evalPrefix(p : P.Prefix) : Promise<Value> {
        const pf = await this.evalPostfix(p.pf);
        if(p.op === '-')
            return -Asserts.assertNumber(pf);
        if(p.op === '!')
            return !Checks.isTrue(pf);
        return pf;
    }
    async idxList(x : Value, idx : P.Expr) : Promise<Value> {
        const ls = Asserts.assertIndexable(x);
        const v = Asserts.assertNumber(await this.evalExpr(idx));
        if(v < 0 || v >= ls.length)
            throw new RuntimeError(`Index ${v} out of bounds`);
        return ls[v];
    }
    async evalAtom(at : P.Atom) : Promise<Value> {
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
    evalListLit(ls : P.ListLit) : Promise<Value> {
        return ls.els ? this.evalCSArgs(ls.els) : new Promise(r => r([]));
    }
    async evalCSArgs(args : P.CSArgs) : Promise<Value[]> {
        const ls : Value [] = [await this.evalExpr(args.head)];
        for(let x of args.tail) {
            ls.push(await this.evalExpr(x.exp));
        }
        return ls;
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
