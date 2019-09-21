import {observable, computed, action} from 'mobx';
import * as uuid from 'uuid';
import {SayType} from './SayType';
import {PCBuilder} from './makePC';

class MyStore {
   
    readonly id: string = uuid.v1();

    @observable
    name: string = 'no name';

    @action
    set setName(name: string) {
        this.name = name;
    }

    @observable
    say: Array<SayType> = [];
    @observable
    hear: Array<SayType> = [];

    @action
    addSay(say: SayType) {
        this.say.push(say);
    }

    @computed
    get timeLine(): Array<SayType> {
        const says = [...this.say, ...this.hear];
        return says.sort((a, b) => {
            return a.date.getTime() - b.date.getTime()
        });
    }

    @observable
    ws: WebSocket | null = null;

    @action
    createWs() {
        const _ws = new WebSocket('wss://cloud.achex.ca');
        _ws.onopen = (ev) => {
            console.log(ev);
            const auth = {auth: 'default@890', passowrd: '19861012'};
            _ws.send(JSON.stringify(auth));
            if (this.pcA) {
                let desc: RTCSessionDescriptionInit | null = null;
                this.pcA.createOffer().then((offer) => {
                    console.log('pcA create offer');
                    desc = offer;
                    return this.pcA!.setLocalDescription(offer);
                }).then(() => {
                    console.log('pcA set local desc(offer)');
                    if (this.ws && this.ws.readyState == WebSocket.OPEN) {
                        const json = {to: 'default@890', data: {
                            id: this.id,
                            to: 'any',
                            offer: desc!.sdp,
                            from: 'pcA'
                        }};
                        this.ws.send(JSON.stringify(json));
                        console.log('pcA send offer')
                    }
                }).catch((err) => {
                    console.error(err);
                });
            }
        };
        _ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            console.log(ev, data);
            if (data.data) {
                const {id, to, offer, answer, candidate, from} = data.data;
                if (id !== this.id && to === 'any') {
                    console.log('message for all');
                    const pendingTimeA = Math.floor(Math.random() * 5 + 1);
                    const pendingTimeB = Math.floor(Math.random() * 5 + 1);
                    if (offer && this.pcB && this.pcB.remoteDescription === null) {
                        console.log('pending.. ' + pendingTimeA + 'sec');
                        setTimeout(() => {
                            this.pcBtgtId = id;
                            let answer: RTCSessionDescriptionInit | null = null;
                            const offerDesc = new RTCSessionDescription({
                                type: 'offer',
                                sdp: offer
                            });
                            this.pcB!.setRemoteDescription(offerDesc).then(() => {
                                console.log('pcB set remote desc(received offer)');
                                return this.pcB!.createAnswer();
                            }).then((desc) => {
                                answer = desc;
                                return this.pcB!.setLocalDescription(desc);
                            }).then(() => {
                                console.log('pcB set local desc(pcB answer)')
                                if (this.ws && this.ws.readyState == WebSocket.OPEN) {
                                    const json = {to: 'default@890', data: {
                                        id: this.id,
                                        to: id,
                                        answer,
                                        from: 'pcB'
                                    }};
                                    this.ws.send(JSON.stringify(json));
                                    console.log('send pcB answer');
                                }
                            }).catch((err) => console.error(err));
                        }, pendingTimeA * 1000);
                    } else if (offer && this.pcC && this.pcC.remoteDescription === null) {
                        console.log('pending.. ' + pendingTimeB + 'sec');
                        setTimeout(() => {
                            this.pcCtgtId = id;
                            let answer: RTCSessionDescriptionInit | null = null;
                            const offerDesc = new RTCSessionDescription({
                                type: 'offer',
                                sdp: offer
                            });
                            this.pcC!.setRemoteDescription(offerDesc).then(() => {
                                console.log('pcC set remote desc(received offer)');
                                return this.pcC!.createAnswer();
                            }).then((desc) => {
                                answer = desc;
                                return this.pcC!.setLocalDescription(desc);
                            }).then(() => {
                                console.log('pcC set local desc(pcC answer)')
                                if (this.ws && this.ws.readyState == WebSocket.OPEN) {
                                    const json = {to: 'default@890', data: {
                                        id: this.id,
                                        to: id,
                                        answer,
                                        from: 'pcC'
                                    }};
                                    this.ws.send(JSON.stringify(json));
                                    console.log('send pcC answer');
                                }
                            }).catch((err) => console.error(err));
                        }, pendingTimeB * 1000);
                    }
                } else if (id !== this.id && to === this.id) {
                    console.log('message for me');
                    if (answer && from && this.pcA && this.pcA.remoteDescription === null) {
                        console.log('pcA set answer');
                        this.pcAtgtId = id
                        const desc = new RTCSessionDescription({
                            type: 'answer',
                            sdp: answer.sdp
                        });
                        this.pcA.setRemoteDescription(desc).catch((err) => console.error(err));
                    } else if (candidate && this.pcA && this.pcA.iceGatheringState !== 'complete') {
                        console.log('pcA add candidate');
                        const cd = new RTCIceCandidate({
                            candidate: candidate.candidate,
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            sdpMid: candidate.sdpMid
                        });
                        this.pcA.addIceCandidate(cd).catch((err) => console.error(err));
                    } 
                }
            }
        };
        _ws.onerror = (ev) => {
            console.error(ev);
        };
        this.ws = _ws;
    }

    @observable
    pcA: RTCPeerConnection | null = null;
    @observable
    pcB: RTCPeerConnection | null = null;
    @observable
    pcC: RTCPeerConnection | null = null;
    @observable 
    pcAtgtId: string | null = null;
    @observable 
    pcBtgtId: string | null = null;
    @observable 
    pcCtgtId: string | null = null;
    dcA: RTCDataChannel | null = null;
    dcB: RTCDataChannel | null = null;
    dcC: RTCDataChannel | null = null;
    pcBTimer: any | null = null;
    pcCTimer: any | null = null;

    @action
    createPCA() {
        const prefix = 'pcA';
        this.pcA = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(prefix, ev);
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
        })
        .setOnIceConnectionstateChange((ev) => {
            console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
            if (ev.currentTarget.iceConnectionState === 'disconnected') {
                this.pcAtgtId = null;
            }
        })
        .setOnIcecandidate((ev) => {
            console.log(prefix, ev);
        })
        .setOnDataChannel((ev: RTCDataChannelEvent) => {
            console.log(prefix, ev);
            this.dcA = ev.channel;
        })
        .build();
        this.pcAtgtId = null;
        if (this.pcA !== null) {
            this.dcA = this.pcA.createDataChannel('chat');
        }
    }

    @action
    createPCB() {
        const prefix = 'pcB';
        this.pcB = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(prefix, ev);
        })
        .setOnIceConnectionstateChange((ev) => {
            console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
            if (ev.currentTarget.iceConnectionState === 'connected' && this.pcBTimer !== null) {
                console.log(prefix, 'connected:', this.pcBtgtId);
                clearTimeout(this.pcBTimer);
                console.log(prefix, 'clear:', this.pcBTimer);
                this.pcBTimer = null;
            } else if (ev.currentTarget.iceConnectionState === 'disconnected') {
                this.createPCB();
            }
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
            if (ev.currentTarget.iceGatheringState === 'gathering') {
                this.pcBTimer = setTimeout(() => {
                    console.log(prefix, 'time out');
                    this.createPCB();
                }, 50000);
            }
        })
        .setOnIcecandidate((ev) => {
            console.log(prefix, ev);
            if (ev.candidate && this.ws && this.ws.readyState === WebSocket.OPEN && this.pcBtgtId !== null) {
                const json = {to: 'default@890', data: {
                    id: this.id,
                    to: this.pcBtgtId,
                    candidate: ev.candidate
                }};
                this.ws.send(JSON.stringify(json));
                console.log('send pcB candidate');
            }
        })
        .setOnDataChannel((ev: RTCDataChannelEvent) => {
            console.log('>>>>', prefix, ev);
            this.dcB = ev.channel;
        })
        .build();
        this.pcBtgtId = null;
    }
    
    @action
    createPCC() {
        const prefix = 'pcC';
        this.pcC = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(prefix, ev);
        })
        .setOnIceConnectionstateChange((ev) => {
            console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
            if (ev.currentTarget.iceConnectionState === 'connected' && this.pcCTimer !== null) {
                console.log(prefix, 'connected:', this.pcCtgtId);
                clearTimeout(this.pcCTimer);
                console.log(prefix, 'clear:', this.pcCTimer);
                this.pcCTimer = null;
            } else if (ev.currentTarget.iceConnectionState === 'disconnected') {
                this.createPCC();
            }
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
            if (ev.currentTarget.iceGatheringState === 'gathering') {
                this.pcCTimer = setTimeout(() => {
                    console.log(prefix, 'time out');
                    this.createPCC();
                }, 50000);
            }
        })
        .setOnIcecandidate((ev) => {
            console.log(prefix, ev);
            if (ev.candidate && this.ws && this.ws.readyState === WebSocket.OPEN && this.pcCtgtId !== null) {
                const json = {to: 'default@890', data: {
                    id: this.id,
                    to: this.pcCtgtId,
                    candidate: ev.candidate
                }};
                this.ws.send(JSON.stringify(json));
                console.log('send pcC candidate');
            }
        })
        .setOnDataChannel((ev: RTCDataChannelEvent) => {
            console.log('>>>>', prefix, ev);
            this.dcC = ev.channel;
        })
        .build();
        this.pcCtgtId = null;
    }

}

type MyStoreType = {
    id: string
    name: string
    say: Array<SayType>
    hear: Array<SayType>
    ws: WebSocket | null
    pcA: RTCPeerConnection | null
    pcB: RTCPeerConnection | null
    pcC: RTCPeerConnection | null
    dcA: RTCDataChannelEvent | null
    dcB: RTCDataChannelEvent | null
    dcC: RTCDataChannelEvent | null
    pcAtgtId: string | null
    pcBtgtId: string | null
    pcCtgtId: string | null
    setName: (name: string) => void
    addSay: (say: SayType) => void
    timeLine: () => Array<SayType>
    createWs: () => void
    createPCA: () => void
    createPCB: () => void
    createPCC: () => void
}

export {
    MyStore, MyStoreType
};