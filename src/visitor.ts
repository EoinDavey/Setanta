import * as P from "./gen_parser";

// ASTVisitor defines a visitor interface for use
// in the visitor pattern.
export interface ASTVisitor<T> {
    visitProgram(a: P.Program): T
    visitIfStmt(a: P.IfStmt): T
    visitBlockStmt(a: P.BlockStmt): T
    visitNuairStmt(a: P.NuairStmt): T
    visitLeStmt(a: P.LeStmt): T
    visitDefnStmt(a: P.DefnStmt): T
    visitAssgnStmt(a: P.AssgnStmt): T
    visitGniomhStmt(a: P.GniomhStmt): T
    visitCtlchStmt(a: P.CtlchStmt): T
    visitToradhStmt(a: P.ToradhStmt): T
    visitExpr(a: P.Expr): T
    visitAnd(a: P.And): T
    visitOr(a: P.Or): T
    visitEq(a: P.Eq): T
    visitComp(a: P.Comp): T
    visitSum(a: P.Sum): T
    visitProduct(a: P.Product): T
    visitPostfix(a: P.Postfix): T
    visitObjLookups(a: P.ObjLookups): T
    visitAtom(a: P.Atom): T
    visitListLit(a: P.ListLit): T
    visitGniomhExpr(a: P.GniomhExpr): T
    visitID(a: P.ID): T
}
