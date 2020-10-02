import { ASTKinds } from "./gen_parser";
import * as P from "./gen_parser";
import { Stmt } from "./values";

enum VarState {
    DECLARED,
    DEFINED,
}

interface GniomhBody {
    args: P.CSIDs | null
    stmts: Stmt[]
}

export class Binder {
    private scopes: Map<string, VarState>[] = [];

    public bindStmts(stmts: Stmt[]): void {
        for(const stmt of stmts)
            this.bindStmt(stmt);
    }

    public bindStmt(stmt: Stmt): void {
        switch (stmt.kind) {
            case ASTKinds.IfStmt:
                return this.bindMá(stmt);
            case ASTKinds.BlockStmt:
                return this.bindStmtBlock(stmt);
            case ASTKinds.AssgnStmt:
                return this.bindAssgn(stmt);
            case ASTKinds.DefnStmt:
                return this.bindDefn(stmt);
            case ASTKinds.NuairStmt:
                return this.bindNuair(stmt);
            case ASTKinds.LeStmt:
                return this.bindLeStmt(stmt);
            case ASTKinds.GniomhStmt:
                return this.bindGniomhStmt(stmt);
            case ASTKinds.ToradhStmt:
                return this.bindToradhStmt(stmt);
            case ASTKinds.CCStmt:
                return;
            case ASTKinds.BrisStmt:
                return;
            case ASTKinds.CtlchStmt:
                return this.bindCtlchStmt(stmt);
            default:
                return this.bindExpr(stmt);
        }
    }

    public bindMá(stmt: P.IfStmt): void {
        this.bindExpr(stmt.expr);
        this.bindStmt(stmt.stmt);
        if(stmt.elsebranch !== null)
            this.bindStmt(stmt.elsebranch.stmt);
    }

    public bindStmtBlock(stmt: P.BlockStmt): void {
        this.enterScope();
        this.bindStmts(stmt.blk);
        this.exitScope();
    }

    public bindAssgn(stmt: P.AssgnStmt): void {
        this.bindExpr(stmt.expr);
        // TODO Resolve ref (P.Postfix)
        // this.bindExpr(stmt.lhs);
    }

    public bindDefn(stmt: P.DefnStmt): void {
        // TODO check if defined in scope already
        this.declareVar(stmt.id.id);
        this.bindExpr(stmt.expr);
        this.defineVar(stmt.id.id);
    }

    public bindNuair(stmt: P.NuairStmt): void {
        this.bindExpr(stmt.expr);
        this.bindStmt(stmt.stmt);
    }

    public bindLeStmt(stmt: P.LeStmt): void {
        // Le-idir stmts create a new scope for the declaration of the
        // loop variable
        this.enterScope();

        this.bindExpr(stmt.strt);
        this.bindExpr(stmt.end);
        if(stmt.step !== null)
            this.bindExpr(stmt.step.step);

        this.defineVar(stmt.id.id);

        this.bindStmt(stmt.stmt);

        this.exitScope();
    }

    public bindGniomhStmt(stmt: P.GniomhStmt): void {
        this.defineVar(stmt.id.id);
        this.bindGniomhBody(stmt);
    }

    public bindToradhStmt(stmt: P.ToradhStmt): void {
        if(stmt.exp)
            this.bindExpr(stmt.exp);
    }

    public bindCtlchStmt(stmt: P.CtlchStmt): void {
        this.defineVar(stmt.id.id);
        // TODO fix once expression resolution added
        /* if(stmt.tuis)
            this.bindExpr(stmt.tuis.id);
        */

        this.enterScope();

        this.defineVar("seo");
        if(stmt.tuis)
            this.defineVar("tuis");

        for(const gniomh of stmt.gniomhs)
            this.bindGniomhBody(gniomh);

        this.exitScope();
    }

    public bindExpr(expr: P.And): void {
        this.bindOr(expr.head);
        for(const tl of expr.tail)
            this.bindOr(tl.trm);
    }

    public bindOr(expr: P.Or): void {
        this.bindEq(expr.head);
        for(const tl of expr.tail)
            this.bindEq(tl.trm);
    }

    public bindEq(expr: P.Eq): void {
        this.bindComp(expr.head);
        for(const tl of expr.tail)
            this.bindComp(tl.trm);
    }

    public bindComp(expr: P.Comp): void {
        this.bindSum(expr.head);
        for(const tl of expr.tail)
            this.bindSum(tl.trm);
    }

    public bindSum(expr: P.Sum): void {
        this.bindProduct(expr.head);
        for(const tl of expr.tail)
            this.bindProduct(tl.trm);
    }

    public bindProduct(expr: P.Product): void {
        this.bindPostfix(expr.head.pf);
        for(const tl of expr.tail)
            this.bindPostfix(tl.trm.pf);
    }

    public bindPostfix(expr: P.Postfix): void {
        this.bindObjLookups(expr.at);
        for(const op of expr.ops) {
            if(op.kind === ASTKinds.PostOp_1) {
                for(const arg of op.args?.exprs ?? [])
                    this.bindExpr(arg);
            } else {
                this.bindExpr(op.expr);
            }
        }
    }

    public bindObjLookups(expr: P.ObjLookups): void {
        this.bindAtom(expr.root);
        for(const attr of expr.attrs)
            this.bindID(attr.id);
    }

    public bindAtom(expr: P.Atom): void {
        switch(expr.kind) {
            case ASTKinds.Atom_1:
                return this.bindExpr(expr.trm);
            case ASTKinds.ID:
                return this.bindID(expr);
            case ASTKinds.ListLit:
                return this.bindListLit(expr);
            case ASTKinds.GniomhExpr:
                return this.bindGniomhBody(expr);
        }
    }

    public bindListLit(expr: P.ListLit): void {
        for(const el of expr.els?.exprs ?? [])
            this.bindExpr(el);
    }

    public bindID(expr: P.ID): void {
        // TODO real work goes here
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

    private bindGniomhBody(gniomh: GniomhBody): void {
        // Create a new scope to define arguments in
        this.enterScope();

        for(const arg of gniomh.args?.ids ?? [])
            this.defineVar(arg);

        this.bindStmts(gniomh.stmts);

        this.exitScope();
    }
}
