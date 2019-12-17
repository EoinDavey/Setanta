import { Value, goLitreacha } from '../../src/values';

test('test goLitreacha', () => {
    interface tc { v: Value, exp: string };
    const cases : tc[] = [
        { v : 123, exp : '123' },
        { v : 0, exp : '0' },
        { v : 0.2, exp : '0.2' },
        { v : 'test', exp : '\'test\'' },
        { v : '', exp : '\'\'' },
        { v : 'gníomhaíochtaí', exp : '\'gníomhaíochtaí\'' },
        { v : true, exp : 'fíor' },
        { v : false, exp : 'breag' },
        { v : [1,2,3], exp : '[1,2,3]' },
        { v : [], exp : '[]' },
        { v : [[1, true], ['breag', []]], exp : '[[1,fíor],[\'breag\',[]]]' },
        {
            v : { ainm: 'id', arity: ()=>0, call: (a: Value[]) => Promise.resolve(null) },
            exp : '< gníomh id >'
        },
        {
            v : { ainm: '', arity: ()=>0, call: (a: Value[]) => Promise.resolve(null) },
            exp : '< gníomh  >'
        },
        {
            v : { ainm: 'gníomh', arity: ()=>0, call: (a: Value[]) => Promise.resolve(null) },
            exp : '< gníomh gníomh >'
        },
    ];
    for(let c of cases){
        expect(goLitreacha(c.v)).toEqual(c.exp);
    }
});