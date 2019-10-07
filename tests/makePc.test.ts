import {PCBuilder} from '#/utils/makePC';

describe('makePc', () => {
    (RTCPeerConnection as any) = jest.fn();
    test('PCBuilderが正常に機能すること', () => {
        const pc = PCBuilder.builder().build();
        expect(pc).not.toBeNull();
    });
});