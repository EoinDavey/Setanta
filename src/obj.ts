import { goTéacs, Value, Obj } from "./values";
import { isTéacs, isLiosta } from "./checks";
import { RuntimeError } from "./error";
import { liostaBuiltins, téacsBuiltins } from "./builtins";

export function getAttr(o: Obj, id: string): Value {
    if(isLiosta(o)) {
        const val = liostaBuiltins.get(id);
        if(val !== undefined)
            return val(o);
        throw new RuntimeError(`Níl aon ball de ${goTéacs(o)} le ainm ${id}`);
    }
    if(isTéacs(o)) {
        const val = téacsBuiltins.get(id);
        if(val !== undefined) 
            return val(o);
        throw new RuntimeError(`Níl aon ball de ${goTéacs(o)} le ainm ${id}`);
    }
    return o.getAttr(id);
}
