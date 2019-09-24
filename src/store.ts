import {observable, computed, action} from 'mobx';
import * as localForage from 'localforage';
import * as uuid from 'uuid';
import {
    APP_NAME, VERSION,
    WEB_SOCKET_URL,
    WEB_SOCKET_USER,
    WEB_SOCKET_PASSWORD
} from './const';
import { SayType } from './SayType';
import { PCBuilder } from './makePC';

class MyStore {
   
    @observable
    id: string = 'no id';

    @observable
    name: string = 'no name';

    @action
    setName(name: string) {
        this.name = name;
        localForage.setItem('user_screen_name', this.name).catch((err) => console.error(err));
    }

    @observable
    say: Array<SayType> = [];

    @observable
    private hear: Array<SayType> = [];

    @action
    addSay(say: SayType) {
        this.say.unshift(say);
        localForage.setItem('user_message', this.say).catch((err) => console.error(err));
    }

    @computed
    get timeLine(): Array<SayType> {
        const says = [...this.say, ...this.hear].filter((e, idx, self) => {
            const len = self.filter(ee => ee.id === e.id).length;
            return len === 1 ? true : false;
        });
        return says.sort((a, b) => {
            return a.date - b.date
        });
    }

    private cache: Array<{id: string, timestamp: number, says: Array<SayType>}> = [];
    private prevCache: Array<{id: string, timestamp: number, says: Array<SayType>}> = [];

    private ws: WebSocket | null = null;

    private createWs() {
        const _ws = new WebSocket(WEB_SOCKET_URL);
        _ws.onopen = (ev) => {
            console.log(ev);
            const auth = {auth: WEB_SOCKET_USER, passowrd: WEB_SOCKET_PASSWORD};
            _ws.send(JSON.stringify(auth));
        };
        _ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            console.log(data);
            const {app} = data;
            if (app && app === (APP_NAME + '@' + VERSION) && data.data) {
                const {id, to, pc, offer, answer, candidate, preOffer, preAnswer} = data.data;
                if (id !== this.id && to === 'any') {
                    console.log('message for all');
                    if (preOffer) {
                        const pendingTime = Math.floor(Math.random() * 5 + 1);
                        console.log('pending.. ' + pendingTime + 'sec');
                        setTimeout(() => {
                            console.log('receive pre offer');
                            const data = {
                                id: this.id,
                                to: id,
                                preAnswer: preOffer
                            };
                            this.wsSend(data).then(() => {
                                console.log('send pre answer');
                            }).catch(err => console.error(err));
                        }, pendingTime * 1000);
                    }
                } else if (id !== this.id && to === this.id) {
                    console.log('message for me');
                    if (preAnswer && preAnswer === this.preOffer) {
                        console.log('receive pre answer');
                        const data = {
                            id: this.id,
                            to: id,
                            offer: this.pcA!.localDescription!.sdp
                        };
                        this.wsSend(data).then(() => {
                            this.preOffer = null;
                            console.log('pcA send offer');
                        }).catch(err => console.error(err));
                    } else if (answer) {
                        console.log('pc<<', pc);
                        const desc = new RTCSessionDescription({
                            type: 'answer',
                            sdp: answer
                        });
                        if (this.pcBtgtId === id && pc && this.pcB && this.pcB.remoteDescription === null) {
                            this.pcB.setRemoteDescription(desc).catch((err) => console.error(err));
                            console.log('pcB set answer');
                            this.cdQueueB.forEach(e => {
                                const data = {
                                    id: this.id,
                                    to: id,
                                    pc,
                                    candidate: e
                                };
                                this.wsSend(data).then(() => {
                                    console.log('send pcC candidate');
                                }).catch((err) => console.error(err));
                            });
                            this.cdQueueB = [];
                        } else if (this.pcCtgtId === id && pc && this.pcC && this.pcC.remoteDescription === null) {
                            this.pcC.setRemoteDescription(desc).catch((err) => console.error(err));
                            console.log('pcC set answer');
                            this.cdQueueC.forEach(e => {
                                const data = {
                                    id: this.id,
                                    to: id,
                                    pc,
                                    candidate: e
                                };
                                this.wsSend(data).catch(() => {
                                    console.log('send pcC candidate');
                                }).catch((err) => console.error(err));
                            });
                            this.cdQueueC = [];
                        } else if (this.pcA && this.pcA.remoteDescription === null) {
                            this.pcAtgtId = id;
                            this.pcA.setRemoteDescription(desc).catch((err) => console.error(err));
                            console.log('pcA set answer');
                            this.candidateQueue.forEach(e => {
                                const data = {
                                    id: this.id,
                                    to: id,
                                    pc,
                                    candidate: e
                                };
                                this.wsSend(data).then(() => {
                                    console.log('send pcA candidate');
                                }).catch(err => console.error(err));
                            });
                            this.candidateQueue = [];
                        }
                    } else if (candidate && pc) {
                        const cd = new RTCIceCandidate({
                            candidate: candidate.candidate,
                            sdpMLineIndex: candidate.sdpMLineIndex,
                            sdpMid: candidate.sdpMid
                        });
                        if (id === this.pcAtgtId && pc == 'A' && this.pcA) {
                            console.log('pcA add candidate', pc);
                            this.pcA.addIceCandidate(cd).catch((err) => console.error(err));
                        } else if (id === this.pcBtgtId && pc == 'B' && this.pcB) {
                            console.log('pcB add candidate', pc);
                            this.pcB.addIceCandidate(cd).catch((err) => console.error(err));
                        } else if (id === this.pcCtgtId && pc == 'C' && this.pcC) {
                            console.log('pcC add candidate', pc);
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
                            const data = {
                                id: this.id,
                                to: id,
                                pc: 'B',
                                answer: answer!.sdp
                            };
                            this.wsSend(data).then(() => {
                                console.log('send pcB answer');
                            }).catch((err) => console.error(err));
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
                            const data = {
                                id: this.id,
                                to: id,
                                pc: 'C',
                                answer: answer!.sdp
                            };
                            this.wsSend(data).then(() => {
                                console.log('send pcC answer');
                            }).catch((err) => console.error(err));
                        }).catch((err) => console.error(err));
                    } else {
                        console.log('[Less than condition]');
                    }
                }
            }
        };
        _ws.onerror = (ev) => { console.error(ev); };
        this.ws = _ws;
    }

    private wsSend(data: object): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            const json = {
                to: WEB_SOCKET_USER,
                app: APP_NAME + '@' + VERSION,
                data: data
            };
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(json));
                resolve(true);
            } else {
                reject(new Error('websocket error'));
            }
        });
        
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
    @observable
    pcAState: string = 'n/a';
    @observable
    pcBState: string = 'n/a';
    @observable
    pcCState: string = 'n/a';
    private dcA: RTCDataChannel | null = null;
    private dcB: RTCDataChannel | null = null;
    private dcC: RTCDataChannel | null = null;
    @observable
    dcAState: string = 'n/a';
    @observable
    dcBState: string = 'n/a';
    @observable
    dcCState: string = 'n/a';
    private preOffer: string | null = null;
    private candidateQueue: Array<RTCIceCandidate> = [];
    private cdQueueB: Array<RTCIceCandidate> = [];
    private cdQueueC: Array<RTCIceCandidate> = [];

    private pcAMakeOffer() {
        let label: any | null = null;
        if (this.pcA !== null) {
            this.pcA.createOffer().then((offer) => {
                console.log('pcA create offer');
                return this.pcA!.setLocalDescription(offer);
            }).then(() => {
                console.log('pcA set local desc(offer)');
                this.preOffer = uuid.v1();
                const data = {
                    id: this.id,
                    to: 'any',
                    preOffer: this.preOffer
                };
                label = setInterval(() => {
                    this.wsSend(data).then(() => {
                        console.log('pcA send "pre" offer')
                        clearInterval(label);
                    }).catch((err) => {
                        console.error(err);
                        console.log('pending send pre offer');
                    });
                }, 1000);
            }).catch((err) => {
                console.error(err);
            });
        }
    }

    @action
    createPCA() {
        const prefix = 'pcA';
        let timer: any | null = null;
        this.pcA = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(prefix, ev);
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
            if (ev.currentTarget.iceGatheringState === 'gathering' && timer === null) {
                timer = setTimeout(() => {
                    console.log('=== time out! recreate pcA ===');
                    this.pcA!.close();
                    this.dcA!.close();
                    this.dcA = null;
                    this.createPCA();
                }, 12000);
                console.log(prefix, 'set timer');
            } else if (this.pcAState !== 'connected' && ev.currentTarget.iceGatheringState === 'complete') {
                console.log('=== recreate pcA ===');
                clearTimeout(timer);
                timer = null;
                this.pcA!.close();
                this.dcA!.close();
                this.createPCA();
            }
        })
        .setOnIceConnectionstateChange((ev) => {
            console.log(prefix, 'iceConnectionState:', ev.currentTarget.iceConnectionState);
            this.pcAState = ev.currentTarget.iceConnectionState;
            if (this.pcAState === 'disconnected' || this.pcAState === 'failed' || this.pcAState === 'closed') {
                console.log('=== recreate pcA ===');
                clearTimeout(timer);
                timer = null;
                this.pcA!.close();
                this.dcA!.close();
                this.createPCA();
            } else if (this.pcAState === 'connected') {
                console.log(prefix, '@@@ connected:', this.pcAtgtId, '@@@');
                clearTimeout(timer);
                timer = null;
            }
        })
        .setOnIcecandidate((ev) => {
            console.log(prefix, ev);
            if (ev.candidate) {
                this.candidateQueue.push(ev.candidate);
            }
        })
        .setOnDataChannel((ev: RTCDataChannelEvent) => {
            console.log(prefix, ev);
            this.dcA = ev.channel;
        })
        .build();
        console.log(prefix, 'create pc complete!');
        this.pcAtgtId = null;
        this.dcA = this.pcA!.createDataChannel('chat');
        this.setupDC(this.dcA, (state) => {
            console.log(prefix, 'dc', state);
            this.dcAState = state;
        });
        this.pcAMakeOffer();
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
            this.pcBState = ev.currentTarget.iceConnectionState;
            if (ev.currentTarget.iceConnectionState === 'connected' && timer !== null) {
                console.log(prefix, 'connected:', this.pcBtgtId);
                clearTimeout(timer);
                console.log(prefix, 'clear:', timer);
                timer = null;
            } else if (ev.currentTarget.iceConnectionState === 'disconnected') {
                clearTimeout(timer);
                timer = null;
                this.pcB!.close();
                if (this.dcB) {this.dcB.close();}
                this.dcB = null;
                this.createPCB();
            }
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
            if (ev.currentTarget.iceGatheringState === 'gathering' && timer === null) {
                timer = setTimeout(() => {
                    console.log(prefix, 'time out');
                    this.pcB!.close();
                    if (this.dcB) {this.dcB.close();}
                    this.dcB = null;
                    this.createPCB();
                }, 42000);
            }
        })
        .setOnIcecandidate((ev) => {
            console.log(prefix, ev);
            if (ev.candidate) {
                this.cdQueueB.push(ev.candidate);
            }
        })
        .setOnDataChannel((ev: RTCDataChannelEvent) => {
            console.log('>>>>', prefix, ev);
            this.dcB = ev.channel;
            this.setupDC(this.dcB, (state) => {
                console.log(prefix, 'dc', state);
                this.dcBState = state;
            });
        })
        .build();
        this.pcBtgtId = null;
        console.log(prefix, 'create pc complete!');
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
            this.pcCState = ev.currentTarget.iceConnectionState;
            if (ev.currentTarget.iceConnectionState === 'connected' && timer !== null) {
                console.log(prefix, 'connected:', this.pcCtgtId);
                clearTimeout(timer);
                console.log(prefix, 'clear:', timer);
                timer = null;
            } else if (ev.currentTarget.iceConnectionState === 'disconnected') {
                clearTimeout(timer);
                timer = null;
                this.pcC!.close();
                if (this.dcC) {this.dcC.close();}
                this.dcC = null;
                this.createPCC();
            }
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(prefix, 'iceGatheringState:', ev.currentTarget.iceGatheringState);
            if (ev.currentTarget.iceGatheringState === 'gathering' && timer === null) {
                timer = setTimeout(() => {
                    console.log(prefix, 'time out');
                    this.pcC!.close();
                    if (this.dcC) {this.dcC.close();}
                    this.dcC = null;
                    this.createPCC();
                }, 42000);
            }
        })
        .setOnIcecandidate((ev) => {
            console.log(prefix, ev);
            if (ev.candidate) {
                this.cdQueueC.push(ev.candidate);
            }
        })
        .setOnDataChannel((ev: RTCDataChannelEvent) => {
            console.log('>>>>', prefix, ev);
            this.dcC = ev.channel;
            this.setupDC(this.dcC, (state) => {
                console.log(prefix, 'dc', state);
                this.dcCState = state;
            });
        })
        .build();
        this.pcCtgtId = null;
        console.log(prefix, 'create pc complete!');
    }

    private setupDC(dc: RTCDataChannel, stateCb: (state: RTCDataChannelState) => void) {
        dc.onopen = (ev) => {
            console.log(ev, dc.readyState);
            stateCb(dc.readyState);
            this.cache.forEach(e => {
                const json = {
                    from: this.id,
                    origin: e.says[0].authorId,
                    payload: {
                        cache: e.says
                    }
                };
                dc.send(JSON.stringify(json))
            });
        };
        dc.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            console.log(ev, data);
            const {from, origin, payload} = data;
            if (from && origin && payload && payload.say) {
                console.log('<<received say>>', from);
                this.cache.push({
                    id: origin, timestamp: Date.now(), says: payload.say
                });
            } else if (from && origin && payload && payload.cache) {
                console.log('<<received cache>>', from);
                const tgt = this.cache.find(e => e.id === origin);
                if (tgt) {
                    if (JSON.stringify(tgt.says) !== JSON.stringify(payload.cache)) {
                        const idx = this.cache.indexOf(tgt);
                        this.cache.splice(idx, 1, {
                            id: origin, timestamp: Date.now(), says: payload.cache
                        });
                    }
                } else {
                    this.cache.push({
                        id: origin, timestamp: Date.now(), says: payload.cache
                    });
                }
            }
        };
        dc.onclose = (ev) => {
            console.log(ev, dc.readyState);
            stateCb(dc.readyState);
        };
        stateCb(dc.readyState);
    }

    constructor() {
        this.createWs();
        this.createPCA();
        this.createPCB();
        this.createPCC();
        let beforeSend: number = -1;
        let beforeCacheSend: number = -1;
        setInterval(() => {
            if (JSON.stringify(this.cache) !== JSON.stringify(this.prevCache)) {
                this.prevCache = Object.assign([], this.cache);
                localForage.setItem('user_message_cache', this.cache).catch((err) => console.error(err));
                console.log('!cache changed!', this.cache);
                let ids: Set<string> = new Set();
                this.cache.forEach(e => ids.add(e.id));
                let newHear: Array<SayType> = [];
                ids.forEach(e => {
                    let filtered = this.cache.filter(ee => ee.id === e);
                    console.log(filtered);
                    if (filtered && filtered.length > 0) {
                        if (filtered.length >= 2) {
                            filtered = filtered.sort((a, b) => {
                                return b.timestamp - a.timestamp;
                            });
                        }
                        if (filtered[0].says) {
                            newHear = [...filtered[0].says, ...newHear];
                        }
                    } 
                });
                this.hear = Object.assign([], newHear);
            }
            if (this.say.length > 0 && this.say[0].date > beforeSend) {
                const json = {
                    from: this.id,
                    origin: this.say[0].authorId,
                    payload: {
                        say: this.say
                    }
                };
                let count = 0;
                [this.dcA, this.dcB, this.dcC].forEach(dc => {
                    if (dc && dc.readyState === 'open') {
                        dc.send(JSON.stringify(json))
                        count += 1;
                    }
                });
                if (count > 0) {
                    beforeSend = Date.now();
                    console.log('[[send say]]');
                }
            }
            if (this.cache.length > 0 
                    && this.cache[this.cache.length - 1].timestamp > beforeCacheSend) {
                let count = 0;
                this.cache.forEach(e => {
                    const json = {
                        from: this.id,
                        origin: e.says[0].authorId,
                        payload: {
                            cache: e.says
                        }
                    };
                    [this.dcB, this.dcC].forEach(dc => {
                        if (dc && dc.readyState === 'open') {
                            dc.send(JSON.stringify(json))
                            count += 1;
                        }
                    });
                });
                if (count > 0) {
                    beforeCacheSend = Date.now();
                    console.log('[[send cache]]');
                }
            }
        }, 1500);
        (async () => {
            this.id = await localForage.getItem('user_id') || (() => {
                const _id = uuid.v1();
                localForage.setItem('user_id', _id).catch((err) => console.error(err));
                return _id;
            })();
            this.name = await localForage.getItem('user_screen_name') || 'no name';
            this.say = await localForage.getItem('user_message') || [];
            this.cache = await localForage.getItem('user_message_cache') || [];
            console.log(this.id, this.name);
        })();
    }

}

type MyStoreType = {
    id: string
    name: string
    say: Array<SayType>
    pcA: RTCPeerConnection | null
    pcB: RTCPeerConnection | null
    pcC: RTCPeerConnection | null
    pcAtgtId: string | null
    pcBtgtId: string | null
    pcCtgtId: string | null
    pcAState: string
    pcBState: string
    pcCState: string
    dcAState: string 
    dcBState: string 
    dcCState: string 
    setName(name: string): void
    addSay(say: SayType): void
    timeLine: Array<SayType>
    createPCA(): void
    createPCB(): void
    createPCC(): void
}

export {
    MyStore, MyStoreType
};