import getJsonCopy from '../src/utils/getJsonCopy';

describe('getJsonCopy', () => {
    test('getJsonCopyが正常に機能すること', () => {
        const obj = {hoge: 'hoge'};
        const copy = getJsonCopy(obj);
        expect(copy).toEqual(obj);
    });
});