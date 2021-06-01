import { Obj, Value, repr } from "./values";
import { isLiosta, isTéacs } from "./checks";
import { RuntimeError } from "./error";
import { liostaBuiltins, téacsBuiltins } from "./builtins";

// Utility functions for object lookups

export function getAttr(o: Obj, id: string): Value {
    if(isLiosta(o)) {
        const val = liostaBuiltins.get(id);
        if(val !== undefined)
            return val(o);
        throw new RuntimeError(`Níl aon ball "${id}" de ${repr(o)}`);
    }
    if(isTéacs(o)) {
        const val = téacsBuiltins.get(id);
        if(val !== undefined) 
            return val(o);
        throw new RuntimeError(`Níl aon ball "${id}" de ${repr(o)}`);
    }
    return o.getAttr(id);
}
