import Watchers from '../src/stores/pcWatchers';

describe('Watchers', () => {
    test('Watchersが正常に機能すること', () => {
        const watchres = new Watchers();
        return Promise.resolve().then(() => {
            return expect(watchres.sayWatcher()).resolves.toBeFalsy();
        }).then(() => {
            return expect(watchres.cacheWatcher()).resolves.toBeFalsy();
        }).then(() => {
            return expect(watchres.userListWatcher()).resolves.toBeFalsy();
        });
    });
});