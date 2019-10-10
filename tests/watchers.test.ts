import Watchers from '../src/stores/pcWatchers';

describe('Watchers', () => {
    test('Watchersが正常に機能すること', () => {
        const watchres = new Watchers();
        expect(watchres.sayWatcher()).resolves.toBe(false);
        expect(watchres.cacheWatcher()).resolves.toBe(true);
        expect(watchres.userListWatcher()).resolves.toBe(true);
        expect(watchres.cacheWatcher()).resolves.toBe(false);
        expect(watchres.userListWatcher()).resolves.toBe(false);
    });
});