import { ASTVisitor } from "../../src/visitor";
import { Binder } from "../../src/bind";

export function resolveASTNode<T extends { accept: (visitor: ASTVisitor<void>) => void }>(node: T): T {
    const b = new Binder();
    b.enterScope();
    node.accept(b);
    b.exitScope();
    return node;
}
