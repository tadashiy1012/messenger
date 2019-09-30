import * as localForage from 'localforage';
import { SayType, UserType, CacheType } from "../types";
import uuid = require('uuid');

export default class Watchers {

    private beforeCacheSend: number = -1;
    private beforeListSend: number = -1;
    private prevList: Array<UserType> = [];
    private prevCache: Array<CacheType> = [];

    constructor(private id: string) {
    }

    cacheWatcher(cache: Array<CacheType>, hearCb: (newHear: Array<SayType>) => void): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (JSON.stringify(cache) !== JSON.stringify(this.prevCache)) {
                this.prevCache = JSON.parse(JSON.stringify(cache));
                localForage.setItem('user_message_cache', cache).catch((err) => console.error(err));
                console.log('!cache changed!', cache);
                let ids: Set<string> = new Set();
                cache.forEach(e => ids.add(e.id));
                let newHear: Array<SayType> = [];
                ids.forEach(e => {
                    let filtered = cache.filter(ee => ee.id === e);
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
                hearCb(newHear);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    cacheSender(cache: Array<CacheType>, dcs: Array<RTCDataChannel | null>): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (cache.length > 0) {
                const filtered = cache.filter(e => {
                    return e.timestamp > this.beforeCacheSend;
                });
                if (filtered.length > 0) {
                    let count = 0;
                    const json = {
                        from: this.id,
                        sendTime: Date.now(),
                        payload: {
                            cache: cache
                        }
                    };
                    dcs.forEach(dc => {
                        if (dc && dc.readyState === 'open') {
                            dc.send(JSON.stringify(json))
                            count += 1;
                        }
                    });
                    if (count > 0) {
                        this.beforeCacheSend = Date.now();
                        console.log('[[send cache]]');
                    }
                }
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    sayWatcher(cache: Array<CacheType>, say: Array<SayType>, currentUser: UserType | null, 
            sayCb: (result: Array<SayType>) => void): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (say.length > 0 && currentUser) {
                const tgt = cache.find(e => e.says[0].authorId === currentUser.serial);
                if (tgt) {
                    if (tgt.says) {
                        tgt.timestamp = Date.now();
                        say.forEach((say: SayType) => {
                            const foundId = tgt.says.find(e => e.id === say.id);
                            if (!foundId) {
                                tgt.says.push(say);
                            }
                        });
                    }
                } else {
                    cache.push({
                        id: uuid.v1(), timestamp: Date.now(), says: say
                    });
                }
                sayCb([]);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    userListWatcher(
            userList: Array<UserType>, 
            dcs: Array<RTCDataChannel | null>
        ): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if ((userList.length > 0 && userList.length > this.beforeListSend) ||
                    (JSON.stringify(userList) !== JSON.stringify(this.prevList))) {
                let count = 0;
                const json = {
                    from: this.id,
                    sendTime: Date.now(),
                    payload: {
                        userList: userList
                    }
                };
                dcs.forEach(dc => {
                    if (dc && dc.readyState === 'open') {
                        dc.send(JSON.stringify(json));
                        count += 1;
                    }
                });
                if (count > 0) {
                    this.beforeListSend = userList.length;
                    console.log('[[send userList]]');
                }
                (async () => {
                    try {
                        console.log(userList);
                        await localForage.setItem('user_list', userList);
                    } catch (err) {
                        console.error(err);
                    }
                })();
                this.prevList = JSON.parse(JSON.stringify(userList));
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

}