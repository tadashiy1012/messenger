import getFullDateStr from '#/utils/getFullDateStr';

describe('getFullDateStr', () => {
    test('getFullDateStrが正常に機能すること', () => {
        const dt = new Date('1986-10-12T00:00:00');
        const str = getFullDateStr(dt.getTime());
        expect(str).toBe('1986-10-12 00:00')
    });
});