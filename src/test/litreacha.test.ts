import { unescapeChars, athchuir } from '../../src/litreacha';
test('test unescapeChars', () => {
    interface tc { inp: string, exp: string}
    const cases : tc[] = [
        { inp: '', exp: '' },
        { inp: 'abc', exp: 'abc' },
        { inp: String.raw`abc\n`, exp: 'abc\n' },
        { inp: String.raw`abc\tabc`, exp: 'abc\tabc' },
        { inp: String.raw`\\\\`, exp: '\\\\' },
        { inp: String.raw`\'abc\'`, exp: '\'abc\'' },
    ];
    for(let c of cases){
        expect(unescapeChars(c.inp)).toEqual(c.exp);
    }
});

test('test athchuir', () => {
    interface tc { inp: string, rep: string, val: string, exp: string}
    const cases : tc[] = [
        { inp: 'aaaa', rep: 'b', val: 'c', exp: 'aaaa' },
        { inp: 'aaaa', rep: 'a', val: 'c', exp: 'cccc' },
        { inp: 'abab', rep: 'ab', val: '', exp: '' },
        { inp: '', rep: 'a', val: 'b', exp: '' },
    ];
    for(let c of cases){
        expect(athchuir(c.inp, c.rep, c.val)).toEqual(c.exp);
    }
});
