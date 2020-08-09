import { syntaxErrString } from "../error";
import { parse } from "../gen_parser";

test("test syntaxErrString", () => {
    interface TC { inp: string; expErr: string; }
    const cases: TC[] = [
        {
            inp: "(1",
            expErr: "Eisceacht ar líne 1: Suíomh 2: Ag súil le \")\"",
        },
        {
            inp: "[1, 2, 3",
            expErr: "Eisceacht ar líne 1: Suíomh 8: Ag súil le \"]\"",
        },
        {
            inp: "{ scríobh('hey')",
            expErr: "Eisceacht ar líne 1: Suíomh 16: Ag súil le \"}\"",
        },
        {
            inp: "1 +",
            expErr: "Eisceacht ar líne 1: Suíomh 3: Ag súil le uimhir, téacs, bool, athróg, liosta, nó gníomh.",
        },
        {
            inp: "creatlach A ó ",
            expErr: `Eisceacht ar líne 1: Suíomh 14: Ag súil le ainm`,
        },
    ];
    for(const tc of cases) {
        const res = parse(tc.inp);
        expect(res.err).not.toBeNull();
        const err = res.err!;
        expect(syntaxErrString(err)).toEqual(tc.expErr);
    }
});
