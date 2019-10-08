import getFullDateStr from '../src/utils/getFullDateStr';

describe('getFullDateStr', () => {
    test('getFullDateStrが正常に機能すること', () => {
        const dt = new Date('1986-10-12T00:00:00');
        const str = getFullDateStr(dt.getTime());
        expect(str).toBe('1986-10-12 00:00');
        const dt2 = new Date('1986-01-01T12:12:12');
        const str2 = getFullDateStr(dt2.getTime());
        expect(str2).toBe('1986-01-01 12:12');
    });
});