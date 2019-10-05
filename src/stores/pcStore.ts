import * as localForage from 'localforage';
import { setupDC, makePCBC, makePreOffer, makePCA, MyWebSocket, makeWS } from "../utils";
import { UserType, CacheType, SayType, PcStateType } from "../types";
import Senders from "./pcSenders";
import Receivers from "./pcReceivers";
import Watchers from "./pcWatchers";
import Transceivers from "./pcTransceivers";
import clientId from './clientId';
import users from './users';
import caches from './caches';
import connStateStore from './connStateStore';

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
    private transceivers: Transceivers | null = null;
    private watchers: Watchers | null = null;
    
    private ws: MyWebSocket | null = null;

    private pcACloseFn() {
        if (this.dcA) {this.dcA.close();}
        if(this.pcA) {this.pcA.close();}
        this.dcA = null;
        this.pcA = null;
        connStateStore.pcAState.target = null;
        this.pcA = makePCA(this.pcACloseFn.bind(this), (state: RTCIceConnectionState) => {
            connStateStore.pcAState.connection = state;
            if (state === 'connected') {
                console.log('pcA', '@@@ connected:', connStateStore.pcAState.target, '@@@');
                setTimeout(() => {
                    if (state === 'connected' && this.dcA && this.dcA.readyState !== 'open') {
                        this.pcACloseFn();
                    }
                }, 10 * 1000);
            } else if (state === 'disconnected' || state === 'failed') {
                connStateStore.pcAState.target = null;
            }
        }, (candidate: RTCIceCandidate) => {
            this.cdQueueA.push(candidate);
        }, (channel: RTCDataChannel) => {
            this.dcA = setupDC(channel, (state) => {
                connStateStore.pcAState.dataChannel = state;
            }, (result: [Array<CacheType> | null, Array<UserType> | null]) => {
                if (result[0] !== null && result[1] === null) {
                    caches.replaceAll(result[0]);
                } else if (result[0] === null && result[1] !== null) {
                    users.replaceAll(result[1]);
                }
            }, [
                this.senders!.cacheSender.bind(this.senders),
                this.senders!.userListSender.bind(this.senders)
            ], [
                this.receivers!.cacheReceiver.bind(this.receivers),
                this.receivers!.usersReceiver.bind(this.receivers)
            ]);
            connStateStore.pcAState.dataChannel = this.dcA.readyState;
        });
        makePreOffer(clientId, this.pcA!, this.ws!).then((preOffer) => {
            this.preOffer = preOffer;
        }).catch((err) => console.error(err));
    };
    
    private pcBCloseFn () {
        if (this.dcB) {this.dcB.close();}
        if (this.pcB) {this.pcB.close();}
        this.dcB = null;
        this.pcB = null;
        connStateStore.pcBState.target = null;
        this.pcB = makePCBC('pcB', this.pcBCloseFn.bind(this), (state: RTCIceConnectionState) => {
            connStateStore.pcBState.connection = state;
            if (state === 'connected') {
                console.log('pcB', '@@@ connected:', connStateStore.pcBState.target, '@@@');
            } else if (state === 'disconnected' || state === 'failed') {
                connStateStore.pcBState.target = null;
            }
        }, (candidate: RTCIceCandidate) => {
            this.cdQueueB.push(candidate);
        }, (channel: RTCDataChannel) => {
            this.dcB = setupDC(channel, (state) => {
                connStateStore.pcBState.dataChannel = state;
            }, (result: [Array<CacheType> | null, Array<UserType> | null]) => {
                if (result[0] !== null && result[1] === null) {
                    caches.replaceAll(result[0]);
                } else if (result[0] === null && result[1] !== null) {
                    users.replaceAll(result[1]);
                }
            }, [
                this.senders!.cacheSender.bind(this.senders),
                this.senders!.userListSender.bind(this.senders)
            ], [
                this.receivers!.cacheReceiver.bind(this.receivers),
                this.receivers!.usersReceiver.bind(this.receivers)
            ]);
            connStateStore.pcBState.dataChannel = this.dcB.readyState;
        });
    };

    private pcCCloseFn() {
        if (this.dcC) {this.dcC.close();}
        if (this.pcC) {this.pcC.close();}
        this.dcC = null;
        this.pcC = null;
        connStateStore.pcCState.target = null;
        this.pcC = makePCBC('pcC', this.pcCCloseFn.bind(this), (state: RTCIceConnectionState) => {
            connStateStore.pcCState.connection = state;
            if (state === 'connected') {
                console.log('pcB', '@@@ connected:', connStateStore.pcCState.target, '@@@');
            } else if (state === 'disconnected' || state === 'failed') {
                connStateStore.pcCState.target = null;
            }
        }, (candidate: RTCIceCandidate) => {
            this.cdQueueC.push(candidate);
        }, (channel: RTCDataChannel) => {
            this.dcC = setupDC(channel, (state) => {
                connStateStore.pcCState.dataChannel = state;
            }, (result: [Array<CacheType> | null, Array<UserType> | null]) => {
                if (result[0] !== null && result[1] === null) {
                    caches.replaceAll(result[0]);
                } else if (result[0] === null && result[1] !== null) {
                    users.replaceAll(result[1]);
                }
            }, [
                this.senders!.cacheSender.bind(this.senders),
                this.senders!.userListSender.bind(this.senders)
            ], [
                this.receivers!.cacheReceiver.bind(this.receivers),
                this.receivers!.usersReceiver.bind(this.receivers)
            ]);
            connStateStore.pcCState.dataChannel = this.dcC.readyState;
        });
    };

    private timerTask = () => {
        const tasks = [
            this.watchers!.sayWatcher(() => {
                const say = this.getSay();
                say.splice(0, say.length, ...[]);
            }),
            this.watchers!.cacheWatcher((result) => {
                const hear = this.getHear();
                hear.splice(0, hear.length, ...result);
            }),
            this.watchers!.userListWatcher()
        ];
        Promise.all(tasks).then((results) => {
            results.forEach(e => {
                if (e[0] && e[1].resultCb && e[1].resultValue) {
                    e[1].resultCb(e[1].resultValue);
                }
            });
        }).catch((err) => console.error(err));
    };

    constructor(
        private getSay: () => Array<SayType>,
        private getHear: () => Array<SayType>,
        private getUser: () => UserType | null
    ) {
        console.log(users.getUsers);
        console.log(caches.getCaches);
        (async() => {
            this.senders = new Senders();
            this.receivers = new Receivers();
            this.transceivers = new Transceivers(() => {
                return this.ws;
            }, (category: string) => {
                if (category === 'A') {
                    return this.pcA;
                } else if (category === 'B') {
                    return this.pcB;
                } else if (category === 'C') {
                    return this.pcC;
                } else {
                    return null;
                }
            }, (category: string) => {
                if (category === 'A') {
                    return this.cdQueueA;
                } else if (category === 'B') {
                    return this.cdQueueB;
                } else if (category === 'C') {
                    return this.cdQueueC;
                } else {
                    return [];
                }
            }, () => {
                return this.preOffer;
            }, () => {
                this.preOffer = null;
            });
            this.watchers = new Watchers(
                () => {
                    return this.getUser();
                }, () => {
                    return this.getSay();
                }
            );
            this.timerTask();
            makeWS(
                this.transceivers.preOfferTransceiver.bind(this.transceivers),
                this.transceivers.offerTansceiver.bind(this.transceivers), 
                this.transceivers.answerTransceiver.bind(this.transceivers), 
                this.transceivers.candidateTransceiver.bind(this.transceivers), 
                this.transceivers.pcBCTransceiver.bind(this.transceivers)
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