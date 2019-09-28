import { PCBuilder } from "./makePC";

export default function makePCBC(
    prefix: string,
    closeCb: () => void, 
    stateCb: (state: RTCIceConnectionState) => void,
    candidateCb: (candidate: RTCIceCandidate) => void, 
    dataChannelCb: (channel: RTCDataChannel) => void
): RTCPeerConnection | null {
    let timer: any | null = null;
    const pc = PCBuilder.builder()
    .setOnNegotiationNeeded((ev) => {
        console.log(prefix, ev);
    })
    .setOnIceConnectionstateChange((ev) => {
        console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
        const state = ev.currentTarget.iceConnectionState;
        if (state === 'connected' && timer !== null) {
            clearTimeout(timer);
            console.log(prefix, 'clear:', timer);
            timer = null;
        } else if (ev.currentTarget.iceConnectionState === 'disconnected') {
            clearTimeout(timer);
            timer = null;
            closeCb();
        }
        stateCb(state);
    })
    .setOnIceGatheringStateChange((ev) => {
        console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
        if (ev.currentTarget.iceGatheringState === 'gathering' && timer === null) {
            timer = setTimeout(() => {
                console.log(prefix, 'time out');
                closeCb();
            }, 42000);
        }
    })
    .setOnIcecandidate((ev: RTCPeerConnectionIceEvent) => {
        console.log(prefix, ev);
        if (ev.candidate) {
            candidateCb(ev.candidate);
        }
    })
    .setOnDataChannel((ev: RTCDataChannelEvent) => {
        console.log('>>>>', prefix, ev);
        dataChannelCb(ev.channel);
    })
    .build();
    console.log(prefix, 'create complete!');
    return pc;
}