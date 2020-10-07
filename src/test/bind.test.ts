import { Binder } from "../bind";
import { parse } from "../gen_parser";

test("verify depth correctness", () => {
    // prog is input program
    // depths is a map of [depth, idx] expected values *in order of usage*
    interface TC { prog: string; depths: [number, number][]; }
    const cases: TC[] = [
        {
            prog: 'a := 2',
            depths: [],
        },
        {
            prog: `a := 2
                   scríobh(a)`,
            depths: [[0, 0]],
        },
        {
            prog: `a := 2
                   { a }`,
            depths: [[1, 0]],
        },
        {
            prog: `a := 2
                   a = 2 * a
                   `,
            depths: [[0, 0], [0, 0]],
        },
        {
            prog: `a := 2
                   má a
                       scríobh(a)`,
            depths: [[0, 0], [0, 0]],
        },
        {
            prog: `a := 2
                   má a {
                       scríobh(a)
                   }`,
            depths: [[0, 0], [1, 0]],
        },
        {
            prog: `a := 2
                   b := a
                   le a idir (a, a, 2 * a) {
                       scríobh(a)
                       scríobh(b)
                   }
                   `,
            depths: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [2, 1]],
        },
        {
            prog: `a := 2
                   b := a
                   le a idir (a, a, 2 * a) {
                       scríobh(a)
                       scríobh(b)
                   }
                   `,
            depths: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [2, 1]],
        },
        {
            prog: `a := 2
                   nuair-a a scríobh(a)
                   nuair-a a { scríobh(a) }
                   `,
            depths: [[0, 0], [0, 0], [0, 0], [1, 0]],
        },
        {
            prog: `a := 2
                   gníomh gn(b) {
                       toradh a + b
                   }
                   `,
            depths: [[1, 0], [0, 0]],
        },
        {
            prog: `a := 2
                   gníomh gn(a) {
                       toradh a
                   }
                   gn
                   `,
            depths: [[0, 0], [0, 1]],
        },
        {
            prog: `a := 2
                   gníomh gn() {
                       gníomh b() {
                            toradh a
                       }
                       a := 2
                       toradh b
                   }
                   scríobh(gn()())
                   `,
            depths: [[2, 0], [0, 0], [0, 1]],
        },
        {
            prog: `a := 2
                   creatlach Ctlch ó a {
                       gníomh a() {
                            Ctlch()
                            scríobh(a)
                       }
                       gníomh b() {
                            scríobh(a)
                       }
                   }
                   `,
            depths: [[0, 0], [2, 1], [2, 0], [2, 0]],
        },
        {
            prog: `a := 2
                   b := gníomh (b) {
                        toradh a + b
                   }
                   `,
            depths: [[1, 0], [0, 0]],
        },
        {
            prog: `a := 2
                   b := [a]
                   b[a[gníomh(a) { b }]] = 2*a[a]
                   `,
            depths: [[0, 0], [0, 1], [0, 0], [1, 1], [0, 0], [0, 0]],
        },
    ];
    for (const c of cases) {
        const res = parse(c.prog);
        expect(res.err).toBeNull();
        expect(res.ast).not.toBeNull();
        const binder = new Binder();
        binder.enterScope();
        binder.visitProgram(res.ast!);
        binder.exitScope();
        const gotDepths: [number, number][] = Array.from(binder.depthMap.entries())
            .sort((a, b) => a[0].start.overallPos - b[0].start.overallPos)
            .map(x => x[1]);
        expect(c.depths).toEqual(gotDepths);
    }
});
