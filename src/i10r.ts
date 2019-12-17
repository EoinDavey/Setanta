import * as P from './gen_parser';
import { ASTKinds } from './gen_parser';
import { callFunc, Comparable, TypeCheck, Gníomh, Value,
    goLitreacha, Checks, Callable, Asserts } from './values';
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
    global : Environment = new Environment();
    constructor(externals? : ArrayLike<[string[], Value]>){
        this.global = Environment.from(Builtins);
        if(externals)
            for(let i = 0; i < externals.length; ++i)
                for(let a of externals[i][0])
                    this.global.define(a, externals[i][1]);
    }
    interpret(p : P.Program) : Promise<void> {
        return this.execStmts(p.stmts, this.global);
    }
    execStmts(stmts : Stmt[], env : Environment) : Promise<void>{
        const f = (x : Promise<void>, y : Stmt) : Promise<void> => {
            return x.then(() => this.execStmt(y, env));
        }
        return stmts.reduce(f, Promise.resolve());
    }
    execStmtBlock(blk : P.BlockStmt, env : Environment) : Promise<void> {
        env = new Environment(env);
        return this.execStmts(blk.blk, env);
    }
    execStmt(st : P.AsgnStmt | P.NonAsgnStmt, env : Environment) : Promise<void> {
        switch(st.kind) {
            case ASTKinds.IfStmt:
                return this.execMá(st, env);
            case ASTKinds.BlockStmt:
                return this.execStmtBlock(st, env);
            case ASTKinds.AssgnStmt:
                return this.execAssgn(st, env);
            case ASTKinds.DefnStmt:
                return this.execDefn(st, env);
            case ASTKinds.NuairStmt:
                return this.execNuair(st, env);
            case ASTKinds.LeStmt:
                return this.execLeStmt(st, env);
            case ASTKinds.GniomhStmt:
                return this.execGniomhStmt(st, env);
            case ASTKinds.ToradhStmt:
                return this.execToradhStmt(st, env);
            case ASTKinds.CCStmt:
                return this.execCCStmt(st);
            case ASTKinds.BrisStmt:
                return this.execBrisStmt(st);
            default:
                return this.evalExpr(st, env).then(x=>{});
        }
    }
    execCCStmt(b : P.CCStmt) : Promise<void> {
        throw CCException;
    }
    execBrisStmt(b : P.BrisStmt) : Promise<void> {
        throw BrisException;
    }
    execToradhStmt(b : P.ToradhStmt, env : Environment) : Promise<void> {
        if(b.exp)
            return this.evalExpr(b.exp, env).then(v => { throw new Toradh(v) });
        return new Promise(r => { throw new Toradh(null) });
    }
    execGniomhStmt(fn : P.GniomhStmt, env : Environment) : Promise<void> {
        return new Promise(r => {
            const execFn = (body : Stmt[], env : Environment) : Promise<Value> => {
                return this.execStmts(body, env).then(e => null).catch(e => {
                    if(e instanceof Toradh)
                        return e.luach;
                    if(e !== BrisException)
                        throw e;
                    return null;
                });
            }
            const args = fn.args ? this.evalCSIDs(fn.args) : [];
            const gníomh = new Gníomh(fn.id.id, fn.stmts, args, env, execFn);
            env.define(fn.id.id, gníomh);
            r();
        });
    }
    execNuair(n : P.NuairStmt, env : Environment) : Promise<void> {
        const step = () : Promise<void> => this.execStmt(n.stmt, env);
        const run : () => Promise<void> = () => this.evalExpr(n.expr, env).then(x => {
            if(!x)
                return Promise.resolve();
            return step().then(
                () => run()
            ).catch(e => {
                if(e === BrisException)
                    return Promise.resolve();
                if(e === CCException)
                    return run();
                throw e;
            });
        });
        return run();
    }
    execLeStmt(n : P.LeStmt, env : Environment) : Promise<void> {
        env = new Environment(env);

        return this.evalExpr(n.strt, env).then(
            st => this.evalExpr(n.end, env).then(
                end => {
                    const s = Asserts.assertNumber(st);
                    const e = Asserts.assertNumber(end);

                    const step = () : Promise<void> => this.execStmt(n.stmt, env);
                    const run : (i : number) => Promise<void> = (i : number) => {
                        if(i >= e)
                            return Promise.resolve();
                        env.define(n.id.id, i);
                        return step().then(
                            () => run(i+1)
                        ).catch(e => {
                            if(e === BrisException)
                                return Promise.resolve();
                            if(e === CCException)
                                return run(i + 1);
                            throw e;
                        });
                    };
                    return run(s);
                }
            )
        );
    }
    execMá(f : P.IfStmt, env : Environment) : Promise<void> {
        return this.evalExpr(f.expr, env).then(v => {
            if(Checks.isTrue(v))
                return this.execStmt(f.stmt, env);
            if(!f.elsebranch)
                return;
            return this.execStmt(f.elsebranch.stmt, env);
        });
    }
    execDefn(a : P.DefnStmt, env : Environment) : Promise<void> {
        return this.evalExpr(a.expr, env).then(val => env.define(a.id.id, val));
    }
    async execAssgn(a : P.AssgnStmt, env : Environment) {
        const val = await this.evalExpr(a.expr, env);
        const ops = a.id.ops;
        if(ops.length){
            let rt = await this.evalID(a.id.id, env);
            for(let i = 0; i < ops.length - 1; ++i){
                const op = ops[i];
                if('args' in op) {
                    const args = op.args ? await this.evalCSArgs(op.args, env) : [];
                    rt = await callFunc(rt, args);
                } else {
                    rt = await this.idxList(rt, op.expr, env);
                }
            }
            const op = ops[ops.length-1];
            if(!('expr' in op))
                throw new RuntimeError(`Cannot assign to function val`);
            const arr = Asserts.assertLiosta(rt);
            const idx = Asserts.assertNumber(await this.evalExpr(op.expr, env));
            if(idx < 0 || idx >= arr.length)
                throw new RuntimeError(`Index ${goLitreacha(idx)} out of bounds`);
            arr[idx] = val;
        } else {
            env.assign(a.id.id.id, await val);
        }
    }
    evalBinOp(a : Value, b : Value, op : string) : Value {
        const g = binOpTable.get(op);
        if(g)
            for(let x of g)
                if(x.lcheck(a) && x.rcheck(b))
                    return x.op(a, b);
        throw new RuntimeError(`Can't apply ${goLitreacha(op)} to ${goLitreacha(a)} and ${goLitreacha(b)}`);
    }
    evalExpr(expr : P.Expr, env : Environment) : Promise<Value> {
        return this.evalAnd(expr, env);
    }
    evalAnd(o : P.And, env : Environment) : Promise<Value> {
        return o.tail.reduce((x : Promise<Value>, y : P.And_$0) : Promise<Value> => 
            x.then(x => {
                if(!x)
                    return x;
                return this.evalOr(y.trm, env);
            })
            , this.evalOr(o.head, env));
    }
    evalOr(o : P.Or, env : Environment) : Promise<Value> {
        return o.tail.reduce((x : Promise<Value>, y : P.Or_$0) : Promise<Value> => 
            x.then(x => {
                if(x)
                    return x;
                return this.evalEq(y.trm, env);
            })
            , this.evalEq(o.head, env));
    }
    evalEq(e : P.Eq, env : Environment) : Promise<Value> {
        return e.tail.reduce((x : Promise<Value>, y : P.Eq_$0) : Promise<Value> =>
            x.then(a => this.evalComp(y.trm, env).then(b => {
                const eq = Checks.isEqual(a, b);
                return y.op === '==' ? eq : !eq;
            }))
        , this.evalComp(e.head, env));
    }
    evalComp(p : P.Comp, env : Environment) : Promise<Value> {
        return p.tail.reduce((x : Promise<Value>, y : P.Comp_$0) : Promise<Value> =>
            x.then(a => this.evalSum(y.trm, env).then(b => this.evalBinOp(a, b, y.op))),
            this.evalSum(p.head, env));
    }
    evalSum(p : P.Sum, env : Environment) : Promise<Value> {
        return p.tail.reduce((x : Promise<Value>, y : P.Sum_$0) : Promise<Value> =>
            x.then(a => this.evalProduct(y.trm, env).then(b => this.evalBinOp(a, b, y.op))),
            this.evalProduct(p.head, env));
    }
    evalProduct(p : P.Product, env : Environment) : Promise<Value> {
        return p.tail.reduce((x : Promise<Value>, y : P.Product_$0) : Promise<Value> =>
            x.then(a => this.evalPrefix(y.trm, env).then(b => this.evalBinOp(a, b, y.op)))
            , this.evalPrefix(p.head, env));
    }
    evalPostfix(p : P.Postfix, env : Environment) : Promise<Value> {
        const v = (x : Promise<Value>, y : P.PostOp) : Promise<Value> => {
            return x.then(x => {
                if('args' in y){
                    if(y.args){
                        return this.evalCSArgs(y.args, env).then(y => {
                            return callFunc(x, y);
                        });
                    }
                    return callFunc(x, []);
                }
                return this.idxList(x, y.expr, env);
            });
        }
        return p.ops.reduce(v, this.evalAtom(p.at, env));
    }
    evalPrefix(p : P.Prefix, env : Environment) : Promise<Value> {
        return this.evalPostfix(p.pf, env).then(pf => {
            if(p.op === '-')
                return -Asserts.assertNumber(pf);
            if(p.op === '!')
                return !Checks.isTrue(pf);
            return pf;
        });
    }
    idxList(x : Value, idx : P.Expr, env : Environment) : Promise<Value> {
        const ls = Asserts.assertIndexable(x);
        return this.evalExpr(idx, env).then(v => {
            v = Asserts.assertNumber(v);
            if(v < 0 || v >= ls.length)
                throw new RuntimeError(`Index ${goLitreacha(v)} out of bounds`);
            return ls[v];
        });
    }
    evalAtom(at : P.Atom, env : Environment) : Promise<Value> {
        switch(at.kind){
            case ASTKinds.Int:
                return Promise.resolve(this.evalInt(at));
            case ASTKinds.Bool:
                return Promise.resolve(this.evalBool(at));
            case ASTKinds.ID:
                return Promise.resolve(this.evalID(at, env));
            case ASTKinds.ListLit:
                return Promise.resolve(this.evalListLit(at, env));
            case ASTKinds.Litreacha:
                return Promise.resolve(this.evalLitreacha(at));
            case ASTKinds.Neamhni:
                return Promise.resolve(null);
        }
        return this.evalExpr(at.trm, env);
    }
    evalLitreacha(ls : P.Litreacha) : Value {
        return unescapeChars(ls.val);
    }
    evalListLit(ls : P.ListLit, env : Environment) : Promise<Value> {
        return ls.els ? this.evalCSArgs(ls.els, env) : Promise.resolve([]);
    }
    evalCSArgs(args : P.CSArgs, env : Environment) : Promise<Value[]> {
        return args.tail.reduce((x : Promise<Value[]>, y : P.CSArgs_$0) : Promise<Value[]> => {
            return x.then(ls => {
                return this.evalExpr(y.exp, env).then(v => {
                    return ls.concat([v]);
                });
            });
        }, this.evalExpr(args.head, env).then(x => [x]));
    }
    evalCSIDs(ids : P.CSIDs) : string[] {
        return [ids.head.id].concat(ids.tail.map(x=>x.id.id));
    }
    evalID(id : P.ID, env : Environment) : Value {
        return env.get(id.id);
    }
    evalBool(b : P.Bool) : boolean {
        return b.bool === 'fíor' || b.bool == 'fior';
    }
    evalInt(i : P.Int) : number {
        return parseInt(i.int);
    }
}
