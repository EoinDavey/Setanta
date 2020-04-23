import { goTéacs, Value, Obj } from "./values";
import { isTéacs, isLiosta } from "./checks";
import { RuntimeError } from "./error";
import { liostaBuiltins, téacsBuiltins } from "./builtins";

export function getAttr(o: Obj, id: string): Value {
    if(isLiosta(o)) {
        if(liostaBuiltins.has(id)) {
            const val = liostaBuiltins.get(id)!; // Safe to cast has we know we have it
            return val(o);
        }
        throw new RuntimeError(`Níl aon ball de ${goTéacs(o)} le ainm ${id}`);
    }
    if(isTéacs(o)) {
        if(téacsBuiltins.has(id)) {
            const val = téacsBuiltins.get(id)!; // Safe to cast has we know we have it
            return val(o);
        }
        throw new RuntimeError(`Níl aon ball de ${goTéacs(o)} le ainm ${id}`);
    }
    return o.getAttr(id);
}
