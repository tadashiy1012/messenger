import * as localForage from 'localforage';
import { SayType, UserType, CacheType } from "../types";
import uuid = require('uuid');

export default class Watchers {

    private prevList: Array<UserType> = [];
    private prevCache: Array<CacheType> = [];

    constructor(private id: string) {
    }

    cacheWatcher(
        cache: Array<CacheType>, 
        hearCb: (newHear: Array<SayType>) => void
    ): Promise<[Boolean, {resultCb?:(resultArg: any) => void, resultValue?: any}]> {
        return new Promise((resolve, reject) => {
            if (JSON.stringify(cache) !== JSON.stringify(this.prevCache)) {
                this.prevCache = JSON.parse(JSON.stringify(cache));
                console.log(cache);
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
                resolve([true, {resultCb: hearCb, resultValue: newHear}]);
            } else {
                resolve([false, {}]);
            }
        });
    }

    sayWatcher(
        cache: Array<CacheType>, 
        say: Array<SayType>, 
        currentUser: UserType | null, 
        sayCb: (result: Array<SayType>) => void
    ): Promise<[Boolean, {resultCb?:(resultArg: any) => void, resultValue?: any}]> {
        return new Promise((resolve, reject) => {
            if (say.length > 0 && currentUser) {
                const tgt = cache.find(e => {
                    if (e.says && e.says.length > 0) {
                        return e.says[0].authorId === currentUser.serial
                    } else {
                        return false;
                    }
                });
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
                resolve([true, {resultCb: sayCb, resultValue: []}]);
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