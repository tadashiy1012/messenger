import sayStore from '../src/stores/sayStore';

describe('sayStore', () => {
    test('sayStoreが正常に機能すること', () => {
        const newSay = {
            id: 'hoge',
            author: 'hoge',
            authorId: 'hoge',
            date: Date.now(),
            like: [],
            reply: [],
            say: 'hoge'
        };
        sayStore.addSay(newSay);
        const says = sayStore.getSays;
        expect(says).not.toBeUndefined();
        expect(says).not.toBeNull();
        expect(says).toHaveLength(1);
        expect(says[0]).toEqual(newSay);
        sayStore.setHear(says);
        const hear = sayStore.getHear;
        expect(hear).not.toBeUndefined();
        expect(hear).not.toBeNull();
        expect(hear).toHaveLength(1);
        expect(hear[0]).toEqual(newSay);
        const tl = sayStore.timeLine;
        expect(tl).not.toBeUndefined();
        expect(tl).not.toBeNull();
        expect(tl).toHaveLength(1);
        expect(tl[0]).toEqual(newSay);
    });
});