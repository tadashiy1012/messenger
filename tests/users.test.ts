import users from '../src/stores/users';
import { UserType } from '../src/types';

describe('users', () => {
    test('usersが正常に機能する', () => {
        expect(users).not.toBeUndefined;
        expect(users.load()).resolves.toBe(true);
        const list = users.getUsers;
        expect(list).not.toBeNull;
        expect(list).toHaveLength(0);
        const newUser: UserType = {
            clientId: 'hoge',
            serial: 'hoge',
            name: 'hoge',
            email: 'hoge@hogemail.com',
            password: 'hoge',
            icon: 'hoge',
            profile: 'hoge',
            like: [],
            follow: [],
            follower: [],
            notify: [],
            update: Date.now()
        };
        users.add(newUser);
        expect(list).toHaveLength(1);
        const found = users.find(newUser.serial);
        expect(found).not.toBeUndefined();
        const idx = users.indexOf(found!);
        expect(idx).not.toBe(-1);
        users.remove(idx);
        expect(list).toHaveLength(0);
    });
});