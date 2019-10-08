import Finder from '../src/utils/finder';

describe('Finder', () => {
    test('Finderが正常に機能すること', (done) => {
        const icon = Finder.findAuthorIcon('hoge');
        expect(icon).not.toBeNull();
        expect(icon).toMatch(/^data:image\/png;base64*/);
        const name = Finder.findAuthorName('hoge');
        expect(name).not.toBeNull();
        expect(name).toBe('no_name');
        const user = Finder.findUser('hoge');
        expect(user).toBeNull();
        const say = Finder.findSay('fuga');
        expect(say).toBeUndefined();
        Finder.findUserSay('fuga').then((result) => {
            expect(result).toEqual([]);
            done();
        }).catch((err) => {
            done(err);
        });
    });
    test('findUserAsync()が正常に機能すること', (done) => {
        Finder.findUserAsync('hoge').then((result) => {
            expect(result).toBeNull();
            done();
        });
    });
});