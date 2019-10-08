import users from '../src/stores/users';

describe('users', () => {
    test('usersが正常に機能する', () => {
        expect(users).not.toBeUndefined;
        expect(users.load()).resolves.toBe(true);
        const list = users.getUsers;
        expect(list).not.toBeNull;
        expect(list).toHaveLength(0);
        const newUser = {
            clientId: 'hoge',
            serial: 'hoge',
            name: 'hoge',
            email: 'hoge@hogemail.com',
            password: 'hoge',
            icon: 'hoge',
            like: [],
            follow: [],
            follower: [],
            update: Date.now()
        };
        users.add(newUser);
        expect(list).toHaveLength(1);
        const found = users.find(newUser);
        expect(found).not.toBeUndefined();
        const idx = users.indexOf(found!);
        expect(idx).not.toBe(-1);
        users.remove(idx);
        expect(list).toHaveLength(0);
    });
});