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
    interpret(p : P.Program) : Promise<void> {
        return this.execStmts(p.stmts);
    }
    execStmts(stmts : Stmt[]) : Promise<void>{
        const f = (x : Promise<void>, y : Stmt) : Promise<void> => {
            return x.then(() => this.execStmt(y));
        }
        return stmts.reduce(f, Promise.resolve());
    }
    execStmtBlock(blk : P.BlockStmt) : Promise<void> {
        const prev = this.env;
        this.env = new Environment(this.env);
        return this.execStmts(blk.blk).finally(()=> this.env = prev);
    }
    execStmt(st : P.AsgnStmt | P.NonAsgnStmt) : Promise<void> {
        switch(st.kind) {
            case ASTKinds.IfStmt:
                return this.execMá(st);
            case ASTKinds.BlockStmt:
                return this.execStmtBlock(st);
            case ASTKinds.AssgnStmt:
                return this.execAssgn(st);
            case ASTKinds.DefnStmt:
                return this.execDefn(st);
            case ASTKinds.NuairStmt:
                return this.execNuair(st);
            case ASTKinds.LeStmt:
                return this.execLeStmt(st);
            case ASTKinds.GniomhStmt:
                return this.execGniomhStmt(st);
            case ASTKinds.ToradhStmt:
                return this.execToradhStmt(st);
            case ASTKinds.CCStmt:
                return this.execCCStmt(st);
            case ASTKinds.BrisStmt:
                return this.execBrisStmt(st);
            default:
                return this.evalExpr(st).then(x=>{});
        }
    }
    execCCStmt(b : P.CCStmt) : Promise<void> {
        throw CCException;
    }
    execBrisStmt(b : P.BrisStmt) : Promise<void> {
        throw BrisException;
    }
    execToradhStmt(b : P.ToradhStmt) : Promise<void> {
        if(b.exp)
            return this.evalExpr(b.exp).then(v => { throw new Toradh(v) });
        return new Promise(r => { throw new Toradh(null) });
    }
    execGniomhStmt(fn : P.GniomhStmt) : Promise<void> {
        return new Promise(r => {
            const execFn = (body : Stmt[], env : Environment) : Promise<Value> => {
                const prev = this.env;
                this.env = env;
                return this.execStmts(body).then(e => null).catch(e => {
                    if(e instanceof Toradh)
                        return e.luach;
                    if(e !== BrisException)
                        throw e;
                    return null;
                }).finally(() => {
                    this.env = prev
                });
            }
            const args = fn.args ? this.evalCSIDs(fn.args) : [];
            const gníomh = new Gníomh(fn.id.id, fn.stmts, args, this.env, execFn);
            this.env.define(fn.id.id, gníomh);
            r();
        });
    }
    execNuair(n : P.NuairStmt) : Promise<void> {
        const step = () : Promise<void> => this.execStmt(n.stmt);
        const run : () => Promise<void> = () => this.evalExpr(n.expr).then(x => {
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
    execLeStmt(n : P.LeStmt) : Promise<void> {
        const prev = this.env
        this.env = new Environment(this.env);

        return this.evalExpr(n.strt).then(
            st => this.evalExpr(n.end).then(
                end => {
                    const s = Asserts.assertNumber(st);
                    const e = Asserts.assertNumber(end);

                    const step = () : Promise<void> => this.execStmt(n.stmt);
                    const run : (i : number) => Promise<void> = (i : number) => {
                        if(i >= e)
                            return Promise.resolve();
                        this.env.define(n.id.id, i);
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
        ).finally(() => this.env = prev);
    }
    execMá(f : P.IfStmt) : Promise<void> {
        return this.evalExpr(f.expr).then(v => {
            if(Checks.isTrue(v))
                return this.execStmt(f.stmt);
            if(!f.elsebranch)
                return;
            return this.execStmt(f.elsebranch.stmt);
        });
    }
    execDefn(a : P.DefnStmt) : Promise<void> {
        return this.evalExpr(a.expr).then(val => this.env.define(a.id.id, val));
    }
    execAssgn(a : P.AssgnStmt) {
        const f = (x : Promise<Value>, y : P.PostOp) : Promise<Value> => {
            return x.then(x => {
                if('args' in y){
                    if(y.args){
                        return this.evalCSArgs(y.args).then(y => {
                            return callFunc(x, y);
                        });
                    }
                    return callFunc(x, []);
                }
                return this.idxList(x, y.expr);
            });
        }
        const ops = a.id.ops;
        if(ops.length){
            return this.evalExpr(a.expr).then(val =>
                ops.slice(0, ops.length-1).reduce(f,
                Promise.resolve(this.evalID(a.id.id))).then(rt => {
                const op = ops[ops.length - 1];
                if(!('expr' in op))
                    throw new RuntimeError(`Cannot assign to function call`);
                const arr = Asserts.assertLiosta(rt);
                this.evalExpr(op.expr).then(x => {
                    const idx = Asserts.assertNumber(x);
                    if(idx < 0 || idx >= arr.length)
                        throw new RuntimeError(`Index ${idx} out of bounds`);
                    arr[idx] = val;
                })
            }));
        }
        return this.evalExpr(a.expr).then(x => this.env.assign(a.id.id.id, x));
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
    evalAnd(o : P.And) : Promise<Value> {
        return o.tail.reduce((x : Promise<Value>, y : P.And_$0) : Promise<Value> => 
            x.then(x => {
                if(!x)
                    return x;
                return this.evalOr(y.trm);
            })
            , this.evalOr(o.head));
    }
    evalOr(o : P.Or) : Promise<Value> {
        return o.tail.reduce((x : Promise<Value>, y : P.Or_$0) : Promise<Value> => 
            x.then(x => {
                if(x)
                    return x;
                return this.evalEq(y.trm);
            })
            , this.evalEq(o.head));
    }
    evalEq(e : P.Eq) : Promise<Value> {
        return e.tail.reduce((x : Promise<Value>, y : P.Eq_$0) : Promise<Value> =>
            x.then(a => this.evalComp(y.trm).then(b => {
                const eq = Checks.isEqual(a, b);
                return y.op === '==' ? eq : !eq;
            }))
        , this.evalComp(e.head));
    }
    evalComp(p : P.Comp) : Promise<Value> {
        return p.tail.reduce((x : Promise<Value>, y : P.Comp_$0) : Promise<Value> =>
            x.then(a => this.evalSum(y.trm).then(b => this.evalBinOp(a, b, y.op))),
            this.evalSum(p.head));
    }
    evalSum(p : P.Sum) : Promise<Value> {
        return p.tail.reduce((x : Promise<Value>, y : P.Sum_$0) : Promise<Value> =>
            x.then(a => this.evalProduct(y.trm).then(b => this.evalBinOp(a, b, y.op))),
            this.evalProduct(p.head));
    }
    evalProduct(p : P.Product) : Promise<Value> {
        return p.tail.reduce((x : Promise<Value>, y : P.Product_$0) : Promise<Value> =>
            x.then(a => this.evalPrefix(y.trm).then(b => this.evalBinOp(a, b, y.op)))
            , this.evalPrefix(p.head));
    }
    evalPostfix(p : P.Postfix) : Promise<Value> {
        const v = (x : Promise<Value>, y : P.PostOp) : Promise<Value> => {
            return x.then(x => {
                if('args' in y){
                    if(y.args){
                        return this.evalCSArgs(y.args).then(y => {
                            return callFunc(x, y);
                        });
                    }
                    return callFunc(x, []);
                }
                return this.idxList(x, y.expr);
            });
        }
        return p.ops.reduce(v, this.evalAtom(p.at));
    }
    evalPrefix(p : P.Prefix) : Promise<Value> {
        return this.evalPostfix(p.pf).then(pf => {
            if(p.op === '-')
                return -Asserts.assertNumber(pf);
            if(p.op === '!')
                return !Checks.isTrue(pf);
            return pf;
        });
    }
    idxList(x : Value, idx : P.Expr) : Promise<Value> {
        const ls = Asserts.assertIndexable(x);
        return this.evalExpr(idx).then(v => {
            v = Asserts.assertNumber(v);
            if(v < 0 || v >= ls.length)
                throw new RuntimeError(`Index ${v} out of bounds`);
            return ls[v];
        });
    }
    evalAtom(at : P.Atom) : Promise<Value> {
        switch(at.kind){
            case ASTKinds.Int:
                return Promise.resolve(this.evalInt(at));
            case ASTKinds.Bool:
                return Promise.resolve(this.evalBool(at));
            case ASTKinds.ID:
                return Promise.resolve(this.evalID(at));
            case ASTKinds.ListLit:
                return Promise.resolve(this.evalListLit(at));
            case ASTKinds.Litreacha:
                return Promise.resolve(this.evalLitreacha(at));
            case ASTKinds.Neamhni:
                return Promise.resolve(null);
        }
        return this.evalExpr(at.trm);
    }
    evalLitreacha(ls : P.Litreacha) : Value {
        return unescapeChars(ls.val);
    }
    evalListLit(ls : P.ListLit) : Promise<Value> {
        return ls.els ? this.evalCSArgs(ls.els) : Promise.resolve([]);
    }
    evalCSArgs(args : P.CSArgs) : Promise<Value[]> {
        return args.tail.reduce((x : Promise<Value[]>, y : P.CSArgs_$0) : Promise<Value[]> => {
            return x.then(ls => {
                return this.evalExpr(y.exp).then(v => {
                    return ls.concat([v]);
                });
            });
        }, this.evalExpr(args.head).then(x => [x]));
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
