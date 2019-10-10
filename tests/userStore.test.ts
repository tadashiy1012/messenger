import userStore from '../src/stores/userStore';

describe('userStore', () => {
    test('userStore.registration()が正常に機能すること', () => {
        return expect(userStore.registration('hoge', 'hoge@hogemail.com', 'hoge')).resolves.toBeTruthy();
    });
    test('userStore.login()が正常に機能すること', () => {
        return userStore.registration('hoge', 'hoge@hogemail.com', 'hoge').then(() => {
            return expect(userStore.login('hoge@hogemail.com', 'hoge')).resolves.toBeTruthy();
        }).then(() => {
            expect(userStore.logged).toBeTruthy();
        }); 
    });
});