import * as localForage from 'localforage';
import { SayType, UserType, CacheType } from "../types";
import uuid = require('uuid');
import users from './users';
import caches from './caches';

export default class Watchers {

    private prevList: Array<UserType> = [];
    private prevCache: Array<CacheType> = [];

    constructor(
        private getUser: () => UserType | null,
        private getSay: () => Array<SayType>,
    ) {
    }

    cacheWatcher(
        hearCb: (result: Array<SayType>) => void
    ): Promise<[Boolean, {resultCb?:(resultArg: any) => void, resultValue?: any}]> {
        return new Promise((resolve, reject) => {
            if (!caches.compare(this.prevCache)) {
                console.log('!cache changed!');
                caches.save().then((result) => {
                    if (result) {
                        this.prevCache = JSON.parse(JSON.stringify(caches.getCaches));
                        let ids = new Set(caches.getCaches.map(e => e.id));
                        let newHear: Array<SayType> = [];
                        ids.forEach(e => {
                            let filtered = caches.getCaches.filter(ee => ee.id === e);
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
                        resolve([true, {resultCb: hearCb, resultValue: newHear}]);
                    } else {
                        resolve([false, {}]);
                    }
                }).catch(err => reject(err));
                
            } else {
                resolve([false, {}]);
            }
        });
    }

    sayWatcher(
        sayCb: (result: Array<CacheType>) => void
    ): Promise<[Boolean, {resultCb?:(resultArg: any) => void, resultValue?: any}]> {
        return new Promise((resolve, reject) => {
            const currentUser = this.getUser();
            const say = this.getSay();
            if (say.length > 0 && currentUser) {
                console.log('!say changed!');
                const tgt = caches.getCaches.find(e => {
                    if (e.id) {
                        return e.id === currentUser.serial;
                    } else {
                        return false;
                    }
                });
                if (tgt && tgt.says) {
                    console.log('cache update', tgt);
                    tgt.timestamp = Date.now();
                    say.forEach((say: SayType) => {
                        const foundId = tgt.says.find(e => e.id === say.id);
                        if (!foundId) {
                            tgt.says.push(say);
                        }
                    });
                } else {
                    console.log('cache new');
                    caches.add({
                        id: currentUser.serial, timestamp: Date.now(), says: [...say]
                    });
                }
                resolve([true, {resultCb: sayCb, resultValue: []}]);
            } else {
                resolve([false, {}]);
            }
        });
    }

    userListWatcher(): Promise<[Boolean, {resultCb?:(resultArg: any) => void, resultValue?: any}]> {
        return new Promise((resolve, reject) => {
            if (JSON.stringify(users) !== JSON.stringify(this.prevList)) {
                users.save().then((result) => {
                    if (result) {
                        console.log('user list saved!');
                        this.prevList = JSON.parse(JSON.stringify(users));
                        resolve([true, {}]);
                    } else {
                        resolve([false, {}]);
                    }
                }).catch(err => {
                    reject(err);
                });
            } else {
                resolve([false, {}]);
            }
        });
    }

}