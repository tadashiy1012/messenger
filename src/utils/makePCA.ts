import { PCBuilder } from "./makePC";

export default function createPCA(
    closeCb: () => void, 
    stateCb: (state: RTCIceConnectionState) => void,
    candidateCb: (candidate: RTCIceCandidate) => void, 
    dataChannelCb: (channel: RTCDataChannel) => void
): RTCPeerConnection | null {
    const prefix = 'pcA';
    let timer: any | null = null;
    const pcA = PCBuilder.builder()
    .setOnNegotiationNeeded((ev) => {
        console.log(prefix, ev);
    })
    .setOnIceGatheringStateChange((ev) => {
        console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
        if (ev.currentTarget.iceGatheringState === 'gathering' && timer === null) {
            timer = setTimeout(() => {
                console.log('=== time out! recreate pcA ===');
                closeCb();
            }, 12000);
            console.log(prefix, 'set timer');
        } else if (ev.currentTarget.iceConnectionState !== 'connected' 
                && ev.currentTarget.iceGatheringState === 'complete') {
            console.log('=== recreate pcA ===');
            clearTimeout(timer);
            timer = null;
            closeCb();
        }
    })
    .setOnIceConnectionstateChange((ev) => {
        console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
        const connState = ev.currentTarget.iceConnectionState;
        if (connState === 'disconnected' || connState === 'failed') {
            console.log('=== recreate pcA ===');
            clearTimeout(timer);
            timer = null;
            closeCb();
        } else if (connState === 'closed') {
            clearTimeout(timer);
            timer = null;
        } else if (connState === 'connected') {
            clearTimeout(timer);
            timer = null;
        }
        stateCb(connState);
    })
    .setOnIcecandidate((ev) => {
        console.log(prefix, ev);
        if (ev.candidate) {
            candidateCb(ev.candidate)
        }
    })
    .setOnDataChannel((ev) => {
        console.log(prefix, ev);
        dataChannelCb(ev.channel);
    })
    .build();
    if (dataChannelCb) {
        const dataChannel = pcA!.createDataChannel('chat');
        console.log(prefix, dataChannel);
        dataChannelCb(dataChannel);
    }
    console.log('pcA make complete');
    return pcA;
}