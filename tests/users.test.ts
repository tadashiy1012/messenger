import users from '../src/stores/users';

describe('users', () => {
    test('usersが正常に機能する', () => {
        expect(users).not.toBeUndefined;
        expect(users.load()).resolves.toBe(true);
        const list = users.getUsers;
        expect(list).not.toBeNull;
        expect(list).toHaveLength(0);
    });
});