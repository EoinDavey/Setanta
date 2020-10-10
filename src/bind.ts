import { ASTKinds, PosInfo } from "./gen_parser";
import * as P from "./gen_parser";
import { PossibleResolution, Stmt } from "./values";
import { ASTVisitor } from "./visitor";
import { StaticError, alreadyDefinedError } from "./error";

// TODO add location to undefinedError
export function resolveASTNode<T extends { accept: (visitor: ASTVisitor<void>) => void }>(node: T): T {
    const b = new Binder();
    b.enterScope();
    node.accept(b);
    b.exitScope();
    return node;
}

type Resolved<T> = T extends { kind: string }
    ? { [K in keyof T]: Resolved<T[K]> }
    : T extends PossibleResolution
    ? { resolved: true, global: false, depth: number, offset: number } | { resolved: true, global: true }
    : T extends (infer X)[]
    ? Resolved<X>[]
    : T;

type DefinedID = {
    defined: true;
    id: string;
};

enum VarState {
    DECLARED,
    DEFINED,
}

interface GniomhBody {
    args: P.CSIDs | null
    stmts: Stmt[]
}

class Scope {
    private nEntries = 0;
    private idxMap: Map<string, number> = new Map();
    private defStatus: Map<string, VarState> = new Map();

    // Declaring an ID defines a new variable and
    // assigns a unique index in this current scope
    public declareVar(id: string, start?: PosInfo, end?: PosInfo): void {
        if(this.idxMap.has(id))
            throw alreadyDefinedError(id, start, end);
        const idx = this.nEntries;
        this.idxMap.set(id, idx);
        this.defStatus.set(id, VarState.DECLARED);
        this.nEntries++;
    }

    public defineVar(id: DefinedID): void {
        this.defStatus.set(id.id, VarState.DEFINED);
    }

    public has(id: string): boolean {
        return this.idxMap.has(id);
    }

    public defined(id: string): boolean {
        return this.defStatus.get(id) === VarState.DEFINED;
    }

    public getIdx(id: string): number | undefined {
        const idx = this.idxMap.get(id);
        return idx;
    }
}

export class Binder implements ASTVisitor<void> {
    // depthMap exists for easier testing
    public depthMap: Map<P.ID, ([number, number] | { global: true})> = new Map();

    private scopes: Scope[] = [];

    public visitProgram(p: P.Program): Resolved<P.Program> {
        this.visitStmts(p.stmts);
        return p as Resolved<P.Program>;
    }

    public visitStmts(stmts: Stmt[]): void {
        for(const stmt of stmts)
            this.visitStmt(stmt);
    }

    public visitStmt(stmt: Stmt): void {
        if(stmt.kind === ASTKinds.CCStmt || stmt.kind === ASTKinds.BrisStmt)
            return;
        stmt.accept<void>(this);
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
        if(this.scopes.length && this.scopes[this.scopes.length - 1].has(stmt.id.id))
            throw alreadyDefinedError(stmt.id.id, stmt.id.start, stmt.id.end);
        const ainm = this.declareVar(stmt.id.id, stmt.id.start, stmt.id.end);
        this.visitExpr(stmt.expr);
        this.defineVar(ainm);
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

        const loopvar = this.declareVar(stmt.id.id, stmt.id.start, stmt.id.end);
        this.defineVar(loopvar);

        // We visit the loop variable ID to resolve it to the immediate scope
        // for use in assigning values to it during loop execution
        this.visitID(stmt.id);

        this.visitStmt(stmt.stmt);

        this.exitScope();
    }

    public visitGniomhStmt(stmt: P.GniomhStmt): void {
        const ainm = this.declareVar(stmt.id.id, stmt.id.start, stmt.id.end);
        this.defineVar(ainm);
        this.visitGniomhBody(stmt);
    }

    public visitToradhStmt(stmt: P.ToradhStmt): void {
        if(stmt.exp)
            this.visitExpr(stmt.exp);
    }

    public visitCtlchStmt(stmt: P.CtlchStmt): void {
        const id = this.declareVar(stmt.id.id, stmt.id.start, stmt.id.end);

        if(stmt.tuis)
            this.visitID(stmt.tuis.id);

        this.defineVar(id);

        this.enterScope();

        const seo = this.declareVar("seo");
        this.defineVar(seo);
        if(stmt.tuis) {
            const tuis = this.declareVar("tuis");
            this.defineVar(tuis);
        }

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
        // No need to bind these
        if(expr.kind === ASTKinds.Teacs || expr.kind === ASTKinds.Int
            || expr.kind === ASTKinds.Bool || expr.kind === ASTKinds.Neamhni)
            return;
        expr.accept<void>(this);
    }

    public visitListLit(expr: P.ListLit): void {
        for(const el of expr.els?.exprs ?? [])
            this.visitExpr(el);
    }

    public visitGniomhExpr(expr: P.GniomhExpr): void {
        return this.visitGniomhBody(expr);
    }

    public visitID(expr: P.ID): void {
        // TODO error on self definition? (a := 2*a)
        // Resolve this variable
        // Find innermost scope containing defined var
        // Do not check the outermost scope, as this is the
        // global scope, which is treated separately
        for(let i = 0; i < this.scopes.length - 1; i++) {
            const idx = this.scopes[this.scopes.length - 1 - i].getIdx(expr.id);
            if(idx === undefined)
                continue;
            // Variable defined in scope i;
            // Variable defined at index idx;
            this.depthMap.set(expr, [i, idx]);
            expr.depth = {resolved: true, global: false, depth: i, offset: idx};
            return;
        }
        this.depthMap.set(expr, { global: true });
        // If we haven't found it, assume its a global (we can't always locate globals
        // for many reasons)
        expr.depth = {resolved: true, global: true};
    }

    public enterScope(): void {
        this.scopes.push(new Scope());
    }

    public exitScope(): void {
        // Check not necessarily required, but helpful for readability
        if(this.scopes.length === 0)
            return;
        this.scopes.pop();
    }

    private declareVar(s: string, start?: PosInfo, end?:PosInfo): DefinedID {
        if(this.scopes.length === 0)
            throw new StaticError(`Ní féidir an athróg ${s} a fhógairt`, start, end);
        this.scopes[this.scopes.length - 1].declareVar(s, start, end);
        return { defined: true, id: s };
    }

    private defineVar(id: DefinedID): void {
        if(this.scopes.length === 0)
            return;
        this.scopes[this.scopes.length - 1].defineVar(id);
    }

    private visitGniomhBody(gniomh: GniomhBody): void {
        // Create a new scope to define arguments in
        this.enterScope();

        for(const arg of gniomh.args?.ids ?? []) {
            const v = this.declareVar(arg.id, arg.start, arg.end);
            this.defineVar(v);
        }

        this.visitStmts(gniomh.stmts);

        this.exitScope();
    }
}
