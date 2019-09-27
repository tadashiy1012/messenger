import {observable, computed, action} from 'mobx';
import * as localForage from 'localforage';
import * as uuid from 'uuid';
import * as bcrypt from 'bcryptjs';
import { SayType, UserType, CacheType } from './types';
import { noImage } from './utils/noImageIcon';
import makeWs from './utils/mekeWS';
import MyWebSocket from './utils/MyWebSocket';
import { setupDC, makePCA, makePreOffer, makePCBC } from './utils';

class MyStore {
   
    @observable
    id: string = uuid.v1();

    @observable
    currentUser: UserType | null = null;

    @computed
    get getUser(): UserType | null {
        return this.currentUser;
    }

    @action
    updateUser(name: string, icon?: string, password?: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const user = Object.assign({}, this.getUser);
                console.log(user);
                user.name = name;
                user.icon = icon || noImage;
                if (password) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);
                    user.password = hash;
                }
                user.update = Date.now();
                this.currentUser = user;
                const found = this.userList.find(e => e.serial === this.currentUser!.serial);
                if (found) {
                    const idx = this.userList.indexOf(found);
                    const user = Object.assign({}, this.getUser);
                    if (user) {
                        this.userList.splice(idx, 1, user);
                    }
                    resolve(true);
                } else {
                    const user = Object.assign({}, this.getUser);
                    if (user) {
                        this.userList.push(user);
                    }
                    resolve(true);
                }
            } else {
                reject(new Error('login state error!'));
            }
        });
    } 

    @observable
    logged: Boolean = false;

    @action
    setLogged(logged: Boolean) {
        this.logged = logged;
    }

    private say: Array<SayType> = [];

    @observable
    private hear: Array<SayType> = [];

    addSay(say: SayType): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const currentSerial = this.currentUser.serial;
                const found = this.userList.find(e => e.serial === currentSerial);
                if (found && found.clientId === this.id) {
                    this.say.push(say);
                    resolve(true);
                } else {
                    reject(new Error('login state error!!'));
                }
            } else {
                reject(new Error('login state error!!'));
            }
        });
    }

    @computed
    get timeLine(): Array<SayType> {
        const says = this.hear.filter((e, idx, self) => {
            const len = self.filter(ee => ee.id === e.id).length;
            return len > 0;
        });
        return says.sort((a, b) => {
            return a.date - b.date
        });
    }

    findAuthorIcon(authorId: string): string {
        const found = this.userList.find(e => e.serial === authorId);
        if (found && found.icon) {
            return found.icon === '' ? noImage : found.icon;
        } else {
            return noImage;
        }
    }

    findAuthorname(authorId: string): string {
        const found = this.userList.find(e => e.serial === authorId);
        if (found && found.name) {
            return found.name
        } else {
            return 'no_name';
        }
    }

    private cache: Array<CacheType> = [];
    private prevCache: Array<CacheType> = [];

    private userList: Array<UserType> = [];
    private prevList: Array<UserType> = [];

    @action
    login(email: string, password: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const found = this.userList.find(e => e.email === email);
            if (found && bcrypt.compareSync(password, found.password)) {
                this.currentUser = {
                    serial: found.serial,
                    name: found.name,
                    email: found.email,
                    password: found.password,
                    icon: found.icon,
                    clientId: this.id,
                    update: Date.now()
                };
                found.clientId = this.currentUser.clientId;
                found.update = this.currentUser.update;
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    @action
    logout(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.setLogged(false);
            if (this.currentUser) {
                const serial = this.currentUser.serial;
                const found = this.userList.find(e => e.serial === serial);
                if (found) {
                    found.clientId = 'no id';
                    found.update = Date.now();
                    this.currentUser = null;
                    resolve(true);
                } else {
                    reject(new Error('user not found'));
                }
            } else {
                reject(new Error('login state error'));
            }
        });
    }

    @action
    registration(name: string, email: string, password: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const filtered = this.userList.filter(e => e.email === email);
            const pass = encodeURI(password);
            if (filtered.length > 0 || pass !== password) {
                resolve(false);
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);
                const user: UserType = {
                    serial: uuid.v1(),
                    name: name,
                    email: email,
                    password: hash,
                    icon: noImage,
                    clientId: this.id,
                    update: Date.now()
                };
                this.userList.push(user);
                resolve(true);
            }
        });
    }

    @observable
    showDetail: Boolean = true;

    @action
    setShowDetail(show: Boolean) {
        this.showDetail = show;
    }

    @observable
    showSetting: Boolean = false;

    @action
    setShowSetting(show: Boolean) {
        this.showSetting = show;
    }

    @action
    allClear(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.cache = [];
            this.userList = [];
            localForage.clear().then(() => {
                this.currentUser = null;
                this.showSetting = false;
                this.logged = false;
                resolve(true);
            }).catch((err) => {
                reject(err);
            })
        });
    }

    private ws: MyWebSocket | null = null;

    private pcA: RTCPeerConnection | null = null;
    private pcB: RTCPeerConnection | null = null;
    private pcC: RTCPeerConnection | null = null;
    private dcA: RTCDataChannel | null = null;
    private dcB: RTCDataChannel | null = null;
    private dcC: RTCDataChannel | null = null;
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
    @observable
    dcAState: string = 'n/a';
    @observable
    dcBState: string = 'n/a';
    @observable
    dcCState: string = 'n/a';
    private preOffer: string | null = null;
    private cdQueueA: Array<RTCIceCandidate> = [];
    private cdQueueB: Array<RTCIceCandidate> = [];
    private cdQueueC: Array<RTCIceCandidate> = [];
    
    constructor() {
        (async () => {
            try {
                this.userList = await localForage.getItem<Array<UserType>>('user_list') || [];
                this.cache = await localForage.getItem('user_message_cache') || [];   
            } catch (error) {
                console.error(error);
            }
            console.log(this.id);
            console.log(this.cache);
            console.log(this.userList);
        })();
        makeWs((payload: any) => {
            return new Promise<Boolean>((resolve) => {
                const {id, to, preOffer} = payload;
                if (id !== this.id && to === 'any') {
                    console.log('message for all');
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
        }, (payload: any) => {
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
        }, (payload: any) => {
            return new Promise<Boolean>((resolve) => {
                const {id, to, pc, answer} = payload;
                if (id !== this.id && to === this.id && answer) {
                    console.log('pc<<', pc, ':', id);
                    if (this.pcA && this.pcA.remoteDescription === null) {
                        const desc = new RTCSessionDescription({
                            type: 'answer',
                            sdp: answer
                        });
                        this.pcAtgtId = id;
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
        }, (payload: any) => {
            return new Promise<Boolean>((resolve) => {
                const {id, to, pc, candidate} = payload;
                if (id !== this.id && to === this.id && candidate && pc) {
                    console.log('pc:', pc);
                    const cd = new RTCIceCandidate({
                        candidate: candidate.candidate,
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        sdpMid: candidate.sdpMid
                    });
                    if (id === this.pcAtgtId && pc == 'A' && this.pcA) {
                        console.log('pcA add candidate', pc);
                        this.pcA.addIceCandidate(cd).catch((err) => console.error(err));
                        resolve(true);
                    } else if (id === this.pcBtgtId && pc == 'B' && this.pcB) {
                        console.log('pcB add candidate', pc);
                        this.pcB.addIceCandidate(cd).catch((err) => console.error(err));
                        resolve(true);
                    } else if (id === this.pcCtgtId && pc == 'C' && this.pcC) {
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
        }, (payload: any) => {
            return new Promise<Boolean>((resolve) => {
                const {id, to, offer} = payload;
                if (id !== this.id && to === this.id && offer && this.pcB && this.pcB.remoteDescription === null) {
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
                } else if (id !== this.id && to === this.id && offer && this.pcC && this.pcC.remoteDescription === null) {
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
        }).then((ws) => {
            console.log('websocket create success!');
            this.ws = ws;
            // PC A
            const pcAStateFn = (state: RTCIceConnectionState) => {
                this.pcAState = state;
                if (state === 'connected') {
                    console.log('pcA', '@@@ connected:', this.pcAtgtId, '@@@');
                    console.log('pcA', this.dcA);
                    setTimeout(() => {
                        if (state === 'connected' && this.dcA && this.dcA.readyState !== 'open') {
                            pcACloseFn();
                        }
                    }, 10 * 1000);
                } else if (state === 'disconnected' || state === 'failed') {
                    this.pcAtgtId = null;
                }
            }; 
            const pcACandidateFn = (candidate: RTCIceCandidate) => {
                this.cdQueueA.push(candidate);
            };
            const pcADataChannelFn = (channel: RTCDataChannel) => {
                console.log('call pcADataChannelFn');
                this.dcA = setupDC(this.id, this.cache, this.userList, channel, (state) => {
                    console.log('pcA', 'dc', state);
                    this.dcAState = state;
                });
                this.dcAState = this.dcA.readyState;
            };
            const pcACloseFn = () => {
                console.log('call pcA close func');
                if (this.dcA) {this.dcA.close();}
                this.pcA!.close();
                this.dcA = null;
                this.pcA = null;
                this.pcAtgtId = null;
                this.pcA = makePCA(pcAStateFn, pcACloseFn, pcACandidateFn, pcADataChannelFn);
                makePreOffer(this.id, this.pcA!, this.ws!).then((preOffer) => {
                    console.log(preOffer);
                    this.preOffer = preOffer;
                }).catch((err) => console.error(err));
            };
            this.pcA = makePCA(pcAStateFn, pcACloseFn, pcACandidateFn, pcADataChannelFn);
            makePreOffer(this.id, this.pcA!, this.ws).then((preOffer) => {
                console.log(preOffer);
                this.preOffer = preOffer;
            }).catch((err) => console.error(err));
            // PC B
            const pcBStateFn = (state: RTCIceConnectionState) => {
                this.pcBState = state;
                if (state === 'disconnected' || state === 'failed') {
                    this.pcBtgtId = null;
                }
            };
            const pcBCandidateFn = (candidate: RTCIceCandidate) => {
                this.cdQueueB.push(candidate);
            };
            const pcBDataChannelFn = (channel: RTCDataChannel) => {
                this.dcB = setupDC(this.id, this.cache, this.userList, channel, (state) => {
                    console.log('pcB', 'dc', state);
                    this.dcBState = state;
                });
                this.dcBState = this.dcB.readyState;
            };
            const pcBCloseFn = () => {
                console.log('call pcB close func');
                if (this.dcB) {this.dcB.close();}
                this.pcB!.close();
                this.dcB = null;
                this.pcB = null;
                this.pcBtgtId = null;
                this.pcB = makePCBC('pcB', pcBStateFn, pcBCloseFn, pcBCandidateFn, pcBDataChannelFn);
            };
            this.pcB = makePCBC('pcB', pcBStateFn, pcBCloseFn, pcBCandidateFn, pcBDataChannelFn);
            // PC C
            const pcCStateFn = (state: RTCIceConnectionState) => {
                this.pcCState = state;
                if (state === 'disconnected' || state === 'failed') {
                    this.pcCtgtId = null;
                }
            };
            const pcCCandidateFn = (candidate: RTCIceCandidate) => {
                this.cdQueueC.push(candidate);
            };
            const pcCDataChannelFn = (channel: RTCDataChannel) => {
                this.dcC = setupDC(this.id, this.cache, this.userList, channel, (state) => {
                    console.log('pcC', 'dc', state);
                    this.dcCState = state;
                });
                this.dcCState = this.dcC.readyState;
            };
            const pcCCloseFn = () => {
                console.log('call pcC close func');
                if (this.dcC) {this.dcC.close();}
                this.pcC!.close();
                this.dcC = null;
                this.pcC = null;
                this.pcCtgtId = null;
                this.pcC = makePCBC('pcC', pcCStateFn, pcCCloseFn, pcCCandidateFn, pcCDataChannelFn);
            };
            this.pcC = makePCBC('pcC', pcCStateFn, pcCCloseFn, pcCCandidateFn, pcCDataChannelFn);

            let beforeCacheSend: number = -1;
            let beforeListSend: number = 0;
            setInterval(() => {
                if (JSON.stringify(this.cache) !== JSON.stringify(this.prevCache)) {
                    this.prevCache = JSON.parse(JSON.stringify(this.cache));
                    localForage.setItem('user_message_cache', this.cache).catch((err) => console.error(err));
                    console.log('!cache changed!', this.cache);
                    let ids: Set<string> = new Set();
                    this.cache.forEach(e => ids.add(e.id));
                    let newHear: Array<SayType> = [];
                    ids.forEach(e => {
                        let filtered = this.cache.filter(ee => ee.id === e);
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
                    this.hear = newHear;
                }
                if (this.say.length > 0) {
                    const tgt = this.cache.find(e => e.id === this.currentUser!.serial);
                    if (tgt) {
                        if (tgt.says) {
                            tgt.timestamp = Date.now();
                            this.say.forEach((say: SayType) => {
                                const foundId = tgt.says.find(e => e.id === say.id);
                                if (!foundId) {
                                    tgt.says.push(say);
                                }
                            });
                        }
                    } else {
                        this.cache.push({
                            id: origin, timestamp: Date.now(), says: this.say
                        });
                    }
                    this.say = [];
                }
                if (this.cache.length > 0) {
                    const filtered = this.cache.filter(e => {
                        return e.timestamp > beforeCacheSend;
                    });
                    if (filtered.length > 0) {
                        let count = 0;
                        this.cache.forEach(e => {
                            if (e.says) {
                                const json = {
                                    from: this.id,
                                    origin: e.says[0].authorId,
                                    sendTime: Date.now(),
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
                            }
                        });
                        if (count > 0) {
                            beforeCacheSend = Date.now();
                            console.log('[[send cache]]');
                        }
                    }
                }
                if ((this.userList.length > 0 && this.userList.length > beforeListSend) ||
                        (JSON.stringify(this.userList) !== JSON.stringify(this.prevList))) {
                    let count = 0;
                    const json = {
                        from: this.id,
                        sendTime: Date.now(),
                        payload: {
                            userList: this.userList
                        }
                    };
                    [this.dcA, this.dcB, this.dcC].forEach(dc => {
                        if (dc && dc.readyState === 'open') {
                            dc.send(JSON.stringify(json));
                            count += 1;
                        }
                    });
                    if (count > 0) {
                        beforeListSend = this.userList.length;
                        console.log('[[send userList]]');
                    }
                    (async () => {
                        try {
                            await localForage.setItem('user_list', this.userList);
                        } catch (err) {
                            console.error(err);
                        }
                    })();
                    this.prevList = JSON.parse(JSON.stringify(this.userList));
                }
            }, 1500);
        }).catch(err => console.error(err));
    }

}

type MyStoreType = {
    id: string
    currentUser: UserType
    getUser: UserType | null
    updateUser(name: string, icon?: string, password?: string): Promise<Boolean>
    logged: Boolean
    setLogged(logged: Boolean): void
    addSay(say: SayType): Promise<Boolean>
    timeLine: Array<SayType>
    findAuthorIcon(authorId: string): string
    findAuthorname(authorId: string): string
    login(email: string, password: string): Promise<Boolean>
    logout(): Promise<Boolean>
    registration(name: string, email: string, password: string): Promise<Boolean>
    showDetail: Boolean
    setShowDetail(show: Boolean): void
    showSetting: Boolean
    setShowSetting(show: Boolean): void
    allClear(): Promise<Boolean>
    pcAtgtId: string
    pcBtgtId: string
    pcCtgtId: string
    pcAState: string
    pcBState: string
    pcCState: string
    dcAState: string 
    dcBState: string 
    dcCState: string 
}

export {
    MyStore, MyStoreType
};