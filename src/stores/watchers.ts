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
                console.log('!cache changed!');
                (async() => {
                    try {
                        await localForage.setItem('user_message_cache', cache); 
                        console.log('cache saved!');
                    } catch (error) {
                        console.error(error);
                    }
                })();
                this.prevCache = JSON.parse(JSON.stringify(cache));
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
                console.log('!say changed!');
                const tgt = cache.find(e => {
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
                    cache.push({
                        id: currentUser.serial, timestamp: Date.now(), says: [...say]
                    });
                }
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
                        await localForage.setItem('user_list', [...userList.map(e => {
                            const copy = Object.assign({}, e);
                            copy.follow = [...copy.follow];
                            copy.follower = [...copy.follower];
                            copy.like = [...copy.like];
                            return copy;
                        })]);
                        console.log('user list saved!');
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