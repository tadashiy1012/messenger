import MyWebSocket from '#/utils/MyWebSocket';

describe('MyWebSocket', () => {
    test('MyWebSocketが正常に機能すること', (done) => {
        const ws = new MyWebSocket('wss://cloud.achex.ca');
        expect(ws).not.toBeNull();
        ws.setOnOpenHandler(() => {
            const state = ws.getCurrentState();
            expect(state).toBe(1);
            done();
        });
    });
});