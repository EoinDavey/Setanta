import { ASTKinds } from "./gen_parser";
import * as P from "./gen_parser";
import { Stmt } from "./values";

type Attach<U> = U extends P.ID
    ? (P.ID & { test: number })
    : { [K in keyof U]: Attach<U> };

enum VarState {
    DECLARED,
    DEFINED,
}

interface GniomhBody {
    args: P.CSIDs | null
    stmts: Stmt[]
}

export class Binder {
    public depthMap: Map<P.ID, number> = new Map();

    private scopes: Map<string, VarState>[] = [];

    public visitProgram(p: P.Program): void {
        this.enterScope();
        this.visitStmts(p.stmts);
        this.exitScope();
    }

    public visitStmts(stmts: Stmt[]): void {
        for(const stmt of stmts)
            this.visitStmt(stmt);
    }

    public visitStmt(stmt: Stmt): void {
        switch (stmt.kind) {
            case ASTKinds.IfStmt:
                return this.visitIfStmt(stmt);
            case ASTKinds.BlockStmt:
                return this.visitBlockStmt(stmt);
            case ASTKinds.AssgnStmt:
                return this.visitAssgnStmt(stmt);
            case ASTKinds.DefnStmt:
                return this.visitDefnStmt(stmt);
            case ASTKinds.NuairStmt:
                return this.visitNuairStmt(stmt);
            case ASTKinds.LeStmt:
                return this.visitLeStmt(stmt);
            case ASTKinds.GniomhStmt:
                return this.visitGniomhStmt(stmt);
            case ASTKinds.ToradhStmt:
                return this.visitToradhStmt(stmt);
            case ASTKinds.CCStmt:
                return;
            case ASTKinds.BrisStmt:
                return;
            case ASTKinds.CtlchStmt:
                return this.visitCtlchStmt(stmt);
            default:
                return this.visitExpr(stmt);
        }
    }

    public visitIfStmt(stmt: P.IfStmt): void {
        this.visitExpr(stmt.expr);
        this.visitStmt(stmt.stmt);
        if(stmt.elsebranch !== null)
            this.visitStmt(stmt.elsebranch.stmt);
    }

    public visitBlockStmt(stmt: P.BlockStmt): void {
        this.enterScope();
        this.visitStmts(stmt.blk);
        this.exitScope();
    }

    public visitAssgnStmt(stmt: P.AssgnStmt): void {
        this.visitPostfix(stmt.lhs);
        this.visitExpr(stmt.expr);
    }

    public visitDefnStmt(stmt: P.DefnStmt): void {
        // TODO check if defined in scope already
        this.declareVar(stmt.id.id);
        this.visitExpr(stmt.expr);
        this.defineVar(stmt.id.id);
    }

    public visitNuairStmt(stmt: P.NuairStmt): void {
        this.visitExpr(stmt.expr);
        this.visitStmt(stmt.stmt);
    }

    public visitLeStmt(stmt: P.LeStmt): void {
        // Le-idir stmts create a new scope for the declaration of the
        // loop variable
        this.visitExpr(stmt.strt);
        this.visitExpr(stmt.end);
        if(stmt.step !== null)
            this.visitExpr(stmt.step.step);

        this.enterScope();

        this.defineVar(stmt.id.id);

        this.visitStmt(stmt.stmt);

        this.exitScope();
    }

    public visitGniomhStmt(stmt: P.GniomhStmt): void {
        this.defineVar(stmt.id.id);
        this.visitGniomhBody(stmt);
    }

    public visitToradhStmt(stmt: P.ToradhStmt): void {
        if(stmt.exp)
            this.visitExpr(stmt.exp);
    }

    public visitCtlchStmt(stmt: P.CtlchStmt): void {
        this.declareVar(stmt.id.id);

        if(stmt.tuis)
            this.visitID(stmt.tuis.id);

        this.defineVar(stmt.id.id);

        this.enterScope();

        this.defineVar("seo");
        if(stmt.tuis)
            this.defineVar("tuis");

        for(const gniomh of stmt.gniomhs)
            this.visitGniomhBody(gniomh);

        this.exitScope();
    }

    public visitExpr(expr: P.Expr): void {
        return this.visitAnd(expr);
    }

    public visitAnd(expr: P.And): void {
        this.visitOr(expr.head);
        for(const tl of expr.tail)
            this.visitOr(tl.trm);
    }

    public visitOr(expr: P.Or): void {
        this.visitEq(expr.head);
        for(const tl of expr.tail)
            this.visitEq(tl.trm);
    }

    public visitEq(expr: P.Eq): void {
        this.visitComp(expr.head);
        for(const tl of expr.tail)
            this.visitComp(tl.trm);
    }

    public visitComp(expr: P.Comp): void {
        this.visitSum(expr.head);
        for(const tl of expr.tail)
            this.visitSum(tl.trm);
    }

    public visitSum(expr: P.Sum): void {
        this.visitProduct(expr.head);
        for(const tl of expr.tail)
            this.visitProduct(tl.trm);
    }

    public visitProduct(expr: P.Product): void {
        this.visitPostfix(expr.head.pf);
        for(const tl of expr.tail)
            this.visitPostfix(tl.trm.pf);
    }

    public visitPostfix(expr: P.Postfix): void {
        this.visitObjLookups(expr.at);
        for(const op of expr.ops) {
            if(op.kind === ASTKinds.PostOp_1) {
                for(const arg of op.args?.exprs ?? [])
                    this.visitExpr(arg);
            } else {
                this.visitExpr(op.expr);
            }
        }
    }

    public visitObjLookups(expr: P.ObjLookups): void {
        this.visitAtom(expr.root);
        for(const attr of expr.attrs)
            this.visitID(attr.id);
    }

    public visitAtom(expr: P.Atom): void {
        switch(expr.kind) {
            case ASTKinds.Atom_1:
                return this.visitExpr(expr.trm);
            case ASTKinds.ID:
                this.visitID(expr);
                return;
            case ASTKinds.ListLit:
                return this.visitListLit(expr);
            case ASTKinds.GniomhExpr:
                return this.visitGniomhBody(expr);
        }
    }

    public visitListLit(expr: P.ListLit): void {
        for(const el of expr.els?.exprs ?? [])
            this.visitExpr(el);
    }

    public visitID(expr: P.ID): Attach<P.ID> {
        // TODO error on self definition? (a := 2*a)
        // Resolve this variable
        // Find innermost scope containing defined var
        for(let i = 0; i < this.scopes.length; i++) {
            const def = this.scopes[this.scopes.length - 1 - i].get(expr.id);
            if(def === VarState.DEFINED) {
                // TODO fix this error
                if(this.depthMap.has(expr))
                    throw new Error("fugd");
                // Variable defined in scope i;
                this.depthMap.set(expr, i);
                return { ...expr, test: i };
            }
        }
        return {
            ...expr,
            test: -1,
        };
    }

    private enterScope(): void {
        this.scopes.push(new Map());
    }

    private exitScope(): void {
        // Check not necessarily required, but helpful for readability
        if(this.scopes.length === 0)
            return;
        this.scopes.pop();
    }

    private declareVar(s: string): void {
        if(this.scopes.length === 0)
            return;
        this.scopes[this.scopes.length - 1].set(s, VarState.DECLARED);
    }

    private defineVar(s: string): void {
        if(this.scopes.length === 0)
            return;
        this.scopes[this.scopes.length - 1].set(s, VarState.DEFINED);
    }

    private visitGniomhBody(gniomh: GniomhBody): void {
        // Create a new scope to define arguments in
        this.enterScope();

        for(const arg of gniomh.args?.ids ?? [])
            this.defineVar(arg);

        this.visitStmts(gniomh.stmts);

        this.exitScope();
    }
}
