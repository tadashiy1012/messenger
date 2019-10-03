import * as localForage from 'localforage';
import { SayType, UserType, CacheType } from "../types";
import uuid = require('uuid');

export default class Watchers {

    private prevList: Array<UserType> = [];
    private prevCache: Array<CacheType> = [];

    constructor(
        private id: string,
        private getUser: () => UserType | null,
        private getCache: () => Array<CacheType>,
        private getSay: () => Array<SayType>,
    ) {
    }

    cacheWatcher(
        hearCb: (result: Array<SayType>) => void
    ): Promise<[Boolean, {resultCb?:(resultArg: any) => void, resultValue?: any}]> {
        return new Promise((resolve, reject) => {
            const cache = this.getCache();
            if (JSON.stringify(cache) !== JSON.stringify(this.prevCache)) {
                this.prevCache = JSON.parse(JSON.stringify(cache));
                console.log('!cache changed!');
                let ids = new Set(cache.map(e => e.id));
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
                resolve([true, {resultCb: hearCb, resultValue: newHear}]);
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
            const cache = this.getCache();
            if (say.length > 0 && currentUser) {
                const tgt = cache.find(e => {
                    if (e.id) {
                        return e.id === currentUser.serial;
                    } else {
                        return false;
                    }
                });
                if (tgt && tgt.says) {
                    console.log('update', tgt);
                    tgt.timestamp = Date.now();
                    say.forEach((say: SayType) => {
                        const foundId = tgt.says.find(e => e.id === say.id);
                        if (!foundId) {
                            tgt.says.push(say);
                        }
                    });
                } else {
                    console.log('new');
                    cache.push({
                        id: currentUser.serial, timestamp: Date.now(), says: say
                    });
                }
                (async() => {
                    try {
                        await localForage.setItem('user_message_cache', cache); 
                        console.log('cache saved!');  
                    } catch (error) {
                        console.error(error);
                    }
                })();
                resolve([true, {resultCb: sayCb, resultValue: cache}]);
            } else {
                resolve([false, {}]);
            }
        });
    }

    userListWatcher(
        userList: Array<UserType>
    ): Promise<[Boolean, {resultCb?:(resultArg: any) => void, resultValue?: any}]> {
        return new Promise((resolve, reject) => {
            if (JSON.stringify(userList) !== JSON.stringify(this.prevList)) {
                (async () => {
                    try {
                        console.log(userList);
                        await localForage.setItem('user_list', userList);
                    } catch (err) {
                        console.error(err);
                    }
                })();
                this.prevList = JSON.parse(JSON.stringify(userList));
                resolve([true, {}]);
            } else {
                resolve([false, {}]);
            }
        });
    }

}