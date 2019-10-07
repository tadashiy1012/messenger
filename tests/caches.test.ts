import caches from '../src/stores/caches';

describe('caches', () => {
    test('cachesが正常に機能する', () => {
        expect(caches).not.toBeUndefined;
        expect(caches.load()).resolves.toBe(true);
        const cache = caches.getCaches;
        expect(cache).not.toBeNull();
        expect(cache).toHaveLength(0);
    });
});