import caches from '../src/stores/caches';

describe('caches', () => {
    test('cachesが正常に機能する', () => {
        expect(caches).not.toBeUndefined;
        expect(caches.load()).resolves.toBe(true);
        const cache = caches.getCaches;
        expect(cache).not.toBeNull();
        expect(cache).toHaveLength(0);
        const newCache = {
            id: 'hoge',
            timestamp: Date.now(),
            says: []
        };
        caches.add(newCache);
        expect(cache).toHaveLength(1);
        const found = caches.find(newCache);
        expect(found).not.toBeUndefined;
        const idx = caches.indexOf(found!);
        expect(idx).not.toBe(-1);
        caches.remove(idx);
        expect(cache).toHaveLength(0);
    });
});