import { unescapeChars } from '../../src/litreacha';
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
