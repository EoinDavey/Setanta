import { Binder } from "../bind";
import { StaticError } from "../error";
import { parse } from "../gen_parser";

describe("verify depth correctness", () => {
    // prog is input program
    // depths is a map of [depth, idx] expected values *in order of usage*
    interface TC { prog: string; depths: ([number, number]|{ global: true})[]; }
    const g: { global: true } = { global: true };
    const cases: TC[] = [
        {
            prog: 'a := 2',
            depths: [],
        },
        {
            prog: `a := 2
                   scríobh(a)`,
            depths: [g, g],
        },
        {
            prog: `a := 2
                   { a }`,
            depths: [g],
        },
        {
            prog: `a := 2
                   a = 2 * a
                   `,
            depths: [g, g],
        },
        {
            prog: `a := 2
                   má a
                       scríobh(a)`,
            depths: [g, g, g],
        },
        {
            prog: `{
                       a := 2
                       má a
                           scríobh(a)
                   }`,
            depths: [[0, 0], g, [0, 0]],
        },
        {
            prog: `a := 2
                   má a {
                       scríobh(a)
                   }`,
            depths: [g, g, g],
        },
        {
            prog: `a := 2
                   b := a
                   le a idir (a, a, 2 * a) {
                       scríobh(a)
                       scríobh(b)
                   }
                   `,
            depths: [g, [0, 0], g, g, g, g, [1, 0], g, g],
        },
        {
            prog: `a := 2
                   nuair-a a scríobh(a)
                   nuair-a a { scríobh(a) }
                   `,
            depths: [g, g, g, g, g, g],
        },
        {
            prog: `{
                       a := 2
                       nuair-a a scríobh(a)
                       nuair-a a { scríobh(a) }
                   }`,
            depths: [[0, 0], g, [0, 0], [0, 0], g, [1, 0]],
        },
        {
            prog: `a := 2
                   gníomh gn(b) {
                       toradh a + b
                   }
                   `,
            depths: [g, [0, 0]],
        },
        {
            prog: `a := 2
                   gníomh gn(a) {
                       toradh a
                   }
                   gn
                   `,
            depths: [[0, 0], g],
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
            depths: [g, [0, 0], g, g],
        },
        {
            prog: `{
                       a := 2
                       gníomh gn() {
                           gníomh b() {
                                toradh a
                           }
                           a := 2
                           toradh b
                       }
                       scríobh(gn()())
                   }`,
            depths: [[2, 0], [0, 0], g, [0, 1]],
        },
        {
            prog: `{
                       creatlach a {}
                       creatlach Ctlch ó a {
                           gníomh a() {
                                Ctlch()
                                scríobh(a)
                           }
                           gníomh b() {
                                scríobh(a)
                           }
                       }
                   }
                   `,
            depths: [[0, 0], [2, 1], g, [2, 0], g, [2, 0]],
        },
        {
            prog: `a := 2
                   b := gníomh (b) {
                        toradh a + b
                   }
                   `,
            depths: [g, [0, 0]],
        },
        {
            prog: `{
                       a := 2
                       b := [a]
                       b[a[gníomh(a) { b }]] = 2*a[a]
                   }`,
            depths: [[0, 0], [0, 1], [0, 0], [1, 1], [0, 0], [0, 0]],
        },
        {
            prog: `a := neamhní
                   x := x@y@z@a`,
            depths: [g],
        },
    ];
    for(let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        test(`subtest ${i}`, () => {
            const res = parse(tc.prog);
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            const binder = new Binder();
            binder.defineGlobal(binder.declareGlobal("scríobh"));
            binder.visitProgram(res.ast!);
            const gotDepths: ([number, number] | { global: true})[] = Array.from(binder.depthMap.entries())
                .sort((a, b) => a[0].start.overallPos - b[0].start.overallPos)
                .map(x => x[1]);
            expect(tc.depths).toEqual(gotDepths);
        });
    }
});

describe("verify late global binding", () => {
    interface TC { prog: string; hasErr: boolean }
    const cases: TC[] = [
        {
            prog: `gníomh a() {
                        toradh b()
                   }
                   gníomh b() {
                       toradh a()
                   }`,
            hasErr: false,
        },
        {
            prog: `creatlach A {
                       gníomh a() {
                           toradh b()
                       }
                   }
                   a := A()
                   a@a()
                   gníomh b() {
                       toradh 1
                   }`,
            hasErr: false,
        },
        {
            prog: `
                  {
                      gníomh a() {
                          toradh b()
                      }
                  }
                  gníomh b() {
                  }`,
            hasErr: false,
        },
        {
            prog: `
                   a := gníomh() {
                       toradh b
                   }
                   b := 2
                  `,
            hasErr: false,
        },
        {
            prog: `
                   o := 1

                   gníomh a() {
                       o := o
                   }
                  `,
            hasErr: false,
        },
        {
            prog: `
                  {
                      gníomh a() {
                          toradh b()
                      }
                      gníomh b() {
                      }
                  }`,
            hasErr: true,
        },
        {
            prog: `a := b()
                   gníomh b() {
                       toradh a()
                   }`,
            hasErr: true,
        },
    ];
    for(let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        test(`subtest ${i}`, () => {
            const res = parse(tc.prog);
            expect(res.errs).toEqual([]);
            expect(res.ast).not.toBeNull();
            const binder = new Binder();
            let errMsg = "";
            try {
                binder.visitProgram(res.ast!);
            } catch(e) {
                if(!(e instanceof StaticError))
                    throw e;
                errMsg = e.msg;
            }
            if(tc.hasErr)
                expect(errMsg).not.toEqual("");
            else
                expect(errMsg).toEqual("");
        });
    }
});
