import compareJson from '#/utils/compareJson';
import getJsonCopy from '#/utils/getJsonCopy';

describe('compareJson', () => {
    test('compareJsonが正常に機能すること', () => {
        const objA = {hoge: 'hoge'};
        const objB = {hoge: 'fuga'};
        const copy = getJsonCopy(objA);
        const result1 = compareJson(objA, objB);
        expect(result1).toBeFalsy();
        const result2 = compareJson(objA, copy);
        expect(result2).toBeTruthy();
    });
});