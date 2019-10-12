import Receivers from '../src/stores/pcReceivers';
import { DcPayloadType } from '../src/types';

describe('Receivers', () => {
    test('Receiversが正常に機能すること', () => {
        const receivers = new Receivers();
        const payloadA: DcPayloadType = {
            cache: []
        };
        expect(receivers.cacheReceiver(payloadA)).resolves.toBe(true);
        const payloadB: DcPayloadType = {
            userList: []
        };
        expect(receivers.usersReceiver(payloadB)).resolves.toBe(true);
    });
});