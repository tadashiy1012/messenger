import escapeHtml from '../src/utils/escapeHtml'

describe('escapeHtml', () => {
    test('HTML文字列がエスケープされている', () => {
        const html = 'hoge<br />fuga';
        const escaped = escapeHtml(html);
        expect(escaped).not.toBeNull();
        expect(escaped).toBe('hoge&lt;br /&gt;fuga');
    })
})