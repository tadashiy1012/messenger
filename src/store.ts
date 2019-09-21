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
                this.pcA.createOffer().then((offer) => {
                    console.log('pcA create offer');
                    return this.pcA!.setLocalDescription(offer);
                }).then(() => {
                    console.log('pcA set local desc(offer)');
                    this.preOffer = uuid.v1();
                    const json = {to: 'default@890', data: {
                        id: this.id,
                        to: 'any',
                        preOffer: this.preOffer
                    }};
                    this.ws!.send(JSON.stringify(json));
                    console.log('pcA send "pre" offer')
                }).catch((err) => {
                    console.error(err);
                });
            }
        };
        _ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            console.log(data);
            if (data.data) {
                const {id, to, offer, answer, candidate, preOffer, preAnswer} = data.data;
                if (id !== this.id && to === 'any') {
                    console.log('message for all');
                    const pendingTime = Math.floor(Math.random() * 5 + 1);
                    if (preOffer) {
                        console.log('pending.. ' + pendingTime + 'sec');
                        setTimeout(() => {
                            console.log('receive pre offer');
                            const json = {to: 'default@890', data: {
                                id: this.id,
                                to: id,
                                preAnswer: preOffer
                            }};
                            this.ws!.send(JSON.stringify(json));
                            console.log('send pre answer');
                        }, pendingTime * 1000);
                    } 
                } else if (id !== this.id && to === this.id) {
                    console.log('message for me');
                    if (preAnswer && preAnswer === this.preOffer) {
                        console.log('receive pre answer');
                        const json = {to: 'default@890', data: {
                            id: this.id,
                            to: id,
                            offer: this.pcA!.localDescription!.sdp,
                            from: 'pcA'
                        }};
                        this.ws!.send(JSON.stringify(json));
                        this.preOffer = null;
                        console.log('pcA send offer');
                    } else if (answer) {
                        const desc = new RTCSessionDescription({
                            type: 'answer',
                            sdp: answer
                        });
                        if (this.pcBtgtId === id && this.pcB && this.pcB.remoteDescription === null) {
                            this.pcB.setRemoteDescription(desc).catch((err) => console.error(err));
                            console.log('pcB set answer');
                        } else if (this.pcCtgtId === id && this.pcC && this.pcC.remoteDescription === null) {
                            this.pcC.setRemoteDescription(desc).catch((err) => console.error(err));
                            console.log('pcC set answer');
                        } else if (this.pcA && this.pcA.remoteDescription === null) {
                            this.pcAtgtId = id
                            this.pcA.setRemoteDescription(desc).catch((err) => console.error(err));
                            console.log('pcA set answer');
                            this.candidateQueue.forEach(e => {
                                const json = {
                                    to: 'default@890', data: {
                                        id: this.id,
                                        to: id,
                                        candidate: e
                                    }
                                };
                                this.ws!.send(JSON.stringify(json));
                                console.log('send pcA candidate');
                            });
                            this.candidateQueue = [];
                        }
                    } else if (candidate) {
                        const cd = new RTCIceCandidate({
                            candidate: candidate.candidate,
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            sdpMid: candidate.sdpMid
                        });
                        if (id === this.pcAtgtId && this.pcA) {
                            console.log('pcA add candidate');
                            this.pcA.addIceCandidate(cd).catch((err) => console.error(err));
                        } else if (id === this.pcBtgtId && this.pcB) {
                            console.log('pcB add candidate');
                            this.pcB.addIceCandidate(cd).catch((err) => console.error(err));
                        } else if (id === this.pcCtgtId && this.pcC) {
                            console.log('pcC add candidate');
                            this.pcC.addIceCandidate(cd).catch((err) => console.error(err));
                        } else {
                            console.warn('no hit!');
                            console.log(this.pcAtgtId, this.pcBtgtId, this.pcCtgtId);
                        }
                    } else if (offer && this.pcB && this.pcB.remoteDescription === null) {
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
                            const json = {to: 'default@890', data: {
                                id: this.id,
                                to: id,
                                answer: answer!.sdp
                            }};
                            this.ws!.send(JSON.stringify(json));
                            console.log('send pcB answer');
                        }).catch((err) => console.error(err));
                    } else if (offer && this.pcC && this.pcC.remoteDescription === null) {
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
                            const json = {to: 'default@890', data: {
                                id: this.id,
                                to: id,
                                answer
                            }};
                            this.ws!.send(JSON.stringify(json));
                            console.log('send pcC answer');
                        }).catch((err) => console.error(err));
                    } else {
                        console.log('[Less than condition]');
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
    preOffer: string | null = null;
    candidateQueue: Array<RTCIceCandidate> = [];

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
            this.candidateQueue.push(ev.candidate);
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
        let timer: any | null = null;
        this.pcB = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(prefix, ev);
        })
        .setOnIceConnectionstateChange((ev) => {
            console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
            if (ev.currentTarget.iceConnectionState === 'connected' && timer !== null) {
                console.log(prefix, 'connected:', this.pcBtgtId);
                clearTimeout(timer);
                console.log(prefix, 'clear:', timer);
                timer = null;
            } else if (ev.currentTarget.iceConnectionState === 'disconnected') {
                clearTimeout(timer);
                this.createPCB();
            }
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
            if (ev.currentTarget.iceGatheringState === 'gathering') {
                timer = setTimeout(() => {
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
        let timer: any | null = null;
        this.pcC = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(prefix, ev);
        })
        .setOnIceConnectionstateChange((ev) => {
            console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
            if (ev.currentTarget.iceConnectionState === 'connected' && timer !== null) {
                console.log(prefix, 'connected:', this.pcCtgtId);
                clearTimeout(timer);
                console.log(prefix, 'clear:', timer);
                timer = null;
            } else if (ev.currentTarget.iceConnectionState === 'disconnected') {
                clearTimeout(timer);
                this.createPCC();
            }
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
            if (ev.currentTarget.iceGatheringState === 'gathering') {
                timer = setTimeout(() => {
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