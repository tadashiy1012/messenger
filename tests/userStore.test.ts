import userStore from '../src/stores/userStore';

describe('userStore', () => {
    test('userStoreが正常に機能すること', () => {
        expect(userStore.registration('hoge', 'hoge@hogemail.com', 'hoge')).resolves.toBe(true);
        expect(userStore.logged).toBe(false);
        expect(userStore.login('hoge@hogemail.com', 'hoge')).resolves.toBe(true);
        expect(userStore.logged).toBe(true);
        expect(userStore.logout()).resolves.toBe(true);
        expect(userStore.logged).toBe(false);
    });
});