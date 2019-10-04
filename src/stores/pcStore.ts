import { observable } from "mobx";
import * as localForage from 'localforage';
import { setupDC, makePCBC, makePreOffer, makePCA, MyWebSocket } from "../utils";
import { UserType, CacheType, WsPayloadType, SayType, PcStateType } from "../types";
import Senders from "./senders";
import Receivers from "./receivers";
import makeWs from "../utils/mekeWS";
import Watchers from "./watchers";

export default class PcStore {
    
    private pcA: RTCPeerConnection | null = null;
    private pcB: RTCPeerConnection | null = null;
    private pcC: RTCPeerConnection | null = null;
    private dcA: RTCDataChannel | null = null;
    private dcB: RTCDataChannel | null = null;
    private dcC: RTCDataChannel | null = null;
    private preOffer: string | null = null;
    private cdQueueA: Array<RTCIceCandidate> = [];
    private cdQueueB: Array<RTCIceCandidate> = [];
    private cdQueueC: Array<RTCIceCandidate> = [];

    private senders: Senders | null = null;
    private receivers: Receivers | null = null;
    
    private cache: Array<CacheType> = [];
    private ws: MyWebSocket | null = null;
    private watchers: Watchers | null = null;

    pcACloseFn() {
        if (this.dcA) {this.dcA.close();}
        if(this.pcA) {this.pcA.close();}
        this.dcA = null;
        this.pcA = null;
        this.getState()[0].target = null;
        this.pcA = makePCA(this.pcACloseFn.bind(this), (state: RTCIceConnectionState) => {
            this.getState()[0].connection = state;
            if (state === 'connected') {
                console.log('pcA', '@@@ connected:', this.getState()[0].target, '@@@');
                setTimeout(() => {
                    if (state === 'connected' && this.dcA && this.dcA.readyState !== 'open') {
                        this.pcACloseFn();
                    }
                }, 10 * 1000);
            } else if (state === 'disconnected' || state === 'failed') {
                this.getState()[0].target = null;
            }
        }, (candidate: RTCIceCandidate) => {
            this.cdQueueA.push(candidate);
        }, (channel: RTCDataChannel) => {
            this.dcA = setupDC(channel, (state) => {
                this.getState()[0].dataChannel = state;
            }, (result: [Array<CacheType> | null, Array<UserType> | null]) => {
                if (result[0] !== null && result[1] === null) {
                    const cache = this.cache;
                    cache.splice(0, cache.length, ...result[0]);
                } else if (result[0] === null && result[1] !== null) {
                    const users = this.getUsers();
                    users.splice(0, users.length, ...result[1]);
                }
            }, [
                this.senders!.cacheSender.bind(this.senders),
                this.senders!.userListSender.bind(this.senders)
            ], [
                this.receivers!.cacheReceiver.bind(this.receivers),
                this.receivers!.usersReceiver.bind(this.receivers)
            ]);
            this.getState()[0].dataChannel = this.dcA.readyState;
        });
        makePreOffer(this.id, this.pcA!, this.ws!).then((preOffer) => {
            this.preOffer = preOffer;
        }).catch((err) => console.error(err));
    };
    
    pcBCloseFn () {
        if (this.dcB) {this.dcB.close();}
        if (this.pcB) {this.pcB.close();}
        this.dcB = null;
        this.pcB = null;
        this.getState()[1].target = null;
        this.pcB = makePCBC('pcB', this.pcBCloseFn.bind(this), (state: RTCIceConnectionState) => {
            this.getState()[1].connection = state;
            if (state === 'connected') {
                console.log('pcB', '@@@ connected:', this.getState()[1].target, '@@@');
            } else if (state === 'disconnected' || state === 'failed') {
                this.getState()[1].target = null;
            }
        }, (candidate: RTCIceCandidate) => {
            this.cdQueueB.push(candidate);
        }, (channel: RTCDataChannel) => {
            this.dcB = setupDC(channel, (state) => {
                this.getState()[1].dataChannel = state;
            }, (result: [Array<CacheType> | null, Array<UserType> | null]) => {
                if (result[0] !== null && result[1] === null) {
                    const cache = this.cache;
                    cache.splice(0, cache.length, ...result[0]);
                } else if (result[0] === null && result[1] !== null) {
                    const users = this.getUsers();
                    users.splice(0, users.length, ...result[1]);
                }
            }, [
                this.senders!.cacheSender.bind(this.senders),
                this.senders!.userListSender.bind(this.senders)
            ], [
                this.receivers!.cacheReceiver.bind(this.receivers),
                this.receivers!.usersReceiver.bind(this.receivers)
            ]);
            this.getState()[1].dataChannel = this.dcB.readyState;
        });
    };

    pcCCloseFn() {
        if (this.dcC) {this.dcC.close();}
        if (this.pcC) {this.pcC.close();}
        this.dcC = null;
        this.pcC = null;
        this.getState()[2].target = null;
        this.pcC = makePCBC('pcC', this.pcCCloseFn.bind(this), (state: RTCIceConnectionState) => {
            this.getState()[2].connection = state;
            if (state === 'connected') {
                console.log('pcB', '@@@ connected:', this.getState()[2].target, '@@@');
            } else if (state === 'disconnected' || state === 'failed') {
                this.getState()[2].target = null;
            }
        }, (candidate: RTCIceCandidate) => {
            this.cdQueueC.push(candidate);
        }, (channel: RTCDataChannel) => {
            this.dcC = setupDC(channel, (state) => {
                this.getState()[2].dataChannel = state;
            }, (result: [Array<CacheType> | null, Array<UserType> | null]) => {
                if (result[0] !== null && result[1] === null) {
                    const cache = this.cache;
                    cache.splice(0, cache.length, ...result[0]);
                } else if (result[0] === null && result[1] !== null) {
                    const users = this.getUsers();
                    users.splice(0, users.length, ...result[1]);
                }
            }, [
                this.senders!.cacheSender.bind(this.senders),
                this.senders!.userListSender.bind(this.senders)
            ], [
                this.receivers!.cacheReceiver.bind(this.receivers),
                this.receivers!.usersReceiver.bind(this.receivers)
            ]);
            this.getState()[2].dataChannel = this.dcC.readyState;
        });
    };

    // transceiver

    preOfferTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const {id, to, preOffer} = payload;
            if (id !== this.id && to === 'any') {
                console.log('# message for all');
                if (preOffer) {
                    const pendingTime = Math.floor(Math.random() * 5000 + 1000);
                    console.log('pending.. ' + pendingTime + 'msec');
                    setTimeout(() => {
                        console.log('receive pre offer');
                        const data = {
                            id: this.id,
                            to: id,
                            preAnswer: preOffer
                        };
                        this.ws!.send(data).then(() => {
                            console.log('send pre answer');
                        }).catch(err => console.error(err));
                    }, pendingTime);
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }
    
    offerTansceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const {id, to, preAnswer} = payload;
            if (id !== this.id && to === this.id && preAnswer && preAnswer === this.preOffer) {
                console.log('receive pre answer', this.preOffer);
                const data = {
                    id: this.id,
                    to: id,
                    offer: this.pcA!.localDescription!.sdp
                };
                this.ws!.send(data).then(() => {
                    this.preOffer = null;
                    console.log('pcA send offer');
                }).catch(err => console.error(err));
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    answerTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const {id, to, pc, answer} = payload;
            if (id !== this.id && to === this.id && answer) {
                console.log('pc <<', pc, ':', id);
                if (this.pcA && this.pcA.remoteDescription === null) {
                    const desc = new RTCSessionDescription({
                        type: 'answer',
                        sdp: answer
                    });
                    this.getState()[0].target = id;
                    this.pcA.setRemoteDescription(desc).catch((err) => console.error(err));
                    console.log('pcA set answer');
                    this.cdQueueA.forEach(e => {
                        const data = {
                            id: this.id,
                            to: id,
                            pc: pc,
                            candidate: e
                        };
                        this.ws!.send(data).then(() => {
                            console.log('send pcA candidate');
                        }).catch(err => console.error(err));
                    });
                    this.cdQueueA = [];
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    candidateTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const {id, to, pc, candidate} = payload;
            if (id !== this.id && to === this.id && candidate && pc) {
                const cd = new RTCIceCandidate({
                    candidate: candidate.candidate,
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    sdpMid: candidate.sdpMid
                });
                if (id === this.getState()[0].target && pc == 'A' && this.pcA) {
                    console.log('pcA add candidate', pc);
                    this.pcA.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else if (id === this.getState()[1].target && pc == 'B' && this.pcB) {
                    console.log('pcB add candidate', pc);
                    this.pcB.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else if (id === this.getState()[2].target && pc == 'C' && this.pcC) {
                    console.log('pcC add candidate', pc);
                    this.pcC.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    pcBCTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const {id, to, offer} = payload;
            if (id !== this.id && to === this.id && offer 
                    && this.pcB && this.pcB.remoteDescription === null) {
                this.getState()[1].target = id;
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
                    this.ws!.send(data).then(() => {
                        console.log('send pcB answer');
                    }).catch((err) => console.error(err));
                    this.cdQueueB.forEach(e => {
                        const data = {
                            id: this.id,
                            to: id,
                            pc: 'A',
                            candidate: e
                        };
                        this.ws!.send(data).then(() => {
                            console.log('send pcB candidate');
                        }).catch(err => console.error(err));
                    });
                    this.cdQueueB = [];
                    resolve(true);
                }).catch((err) => console.error(err));
            } else if (id !== this.id && to === this.id && offer 
                    && this.pcC && this.pcC.remoteDescription === null) {
                this.getState()[2].target = id;
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
                    this.ws!.send(data).then(() => {
                        console.log('send pcC answer');
                    }).catch((err) => console.error(err));
                    this.cdQueueC.forEach(e => {
                        const data = {
                            id: this.id,
                            to: id,
                            pc: 'A',
                            candidate: e
                        };
                        this.ws!.send(data).then(() => {
                            console.log('send pcC candidate');
                        }).catch(err => console.error(err));
                    });
                    this.cdQueueC = [];
                    resolve(true);
                }).catch((err) => console.error(err));
            } else {
                resolve(false);
            }
        });
    }

    private timerTask = () => {
        const tasks = [
            this.watchers!.sayWatcher((result) => {
                const say = this.getSay();
                say.splice(0, say.length, ...[]);
            }),
            this.watchers!.cacheWatcher((result) => {
                const hear = this.getHear();
                hear.splice(0, hear.length, ...result);
            }),
            this.watchers!.userListWatcher(this.getUsers())
        ];
        Promise.all(tasks).then((results) => {
            results.forEach(e => {
                if (e[0] && e[1].resultCb && e[1].resultValue) {
                    e[1].resultCb(e[1].resultValue);
                }
            });
        }).catch((err) => console.error(err));
    };

    public get getCache(): CacheType[] {
        return this.cache;
    }

    public set setCache(cache: CacheType[]) {
        this.cache = cache;
    }

    constructor(
        private id: string, 
        private getUsers: () => Array<UserType>,
        private getSay: () => Array<SayType>,
        private getHear: () => Array<SayType>,
        private getUser: () => UserType | null,
        private getState: () => [PcStateType, PcStateType, PcStateType]
    ) {
        (async() => {
            try {
                this.cache = await localForage.getItem('user_message_cache') || [];   
            } catch (error) {
                console.error(error);
            }
            this.senders = new Senders(this.id, () => {
                return this.cache;
            }, () => {
                return this.getUsers();
            });
            this.receivers = new Receivers(() => {
                return this.cache;
            }, () => {
                return this.getUsers();
            });
            this.watchers = new Watchers(
                this.id,
                () => {
                    return this.getUser();
                },
                () => {
                    return this.cache;
                }, () => {
                    return this.getSay();
                }
            );
            this.timerTask();
            makeWs(
                this.preOfferTransceiver.bind(this),
                this.offerTansceiver.bind(this), 
                this.answerTransceiver.bind(this), 
                this.candidateTransceiver.bind(this), 
                this.pcBCTransceiver.bind(this)
            ).then((ws) => {
                console.log('websocket create success!');
                this.ws = ws;
                this.pcACloseFn();
                this.pcBCloseFn();
                this.pcCCloseFn();
                setInterval(() => {
                    this.timerTask();
                }, 2000);
            }).catch(err => console.error(err));
        })();
    }


}