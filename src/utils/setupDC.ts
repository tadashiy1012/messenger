import { CacheType, UserType } from "../types";

export default function setupDC(
    dc: RTCDataChannel, 
    stateCb: (state: RTCDataChannelState) => void,
    resultCb: (result: [Array<CacheType> | null, Array<UserType> | null]) => void,
    senders: Array<(dc: RTCDataChannel) => Promise<Boolean>>,
    receivers: Array<(payload: any) => Promise<[Boolean, [Array<CacheType> | null, Array<UserType> | null]]>>
): RTCDataChannel {
    dc.onopen = (ev) => {
        console.log(ev, dc.readyState);
        stateCb(dc.readyState);
        setInterval(() => {
            const tasks = senders.map(e => e(dc));
            Promise.all(tasks).then((results) => {
            }).catch((err) => console.error(err));
        }, 2000);
    };
    dc.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        const {from, payload} = data;
        console.log(ev, data, from);
        const tasks = receivers.map(e => e(payload));
        Promise.all(tasks).then((results) => {
            results.forEach(e => {
                if (e[0]) {
                    resultCb(e[1]);
                }
            });
        }).catch((err) => console.error(err));
    };
    dc.onclose = (ev) => {
        console.log(ev, dc.readyState);
        stateCb(dc.readyState);
    };
    dc.onerror = (ev) => {
        console.error(ev);
    };
    return dc;
}