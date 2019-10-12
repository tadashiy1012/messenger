import { SayType, UserType, CacheType } from "../types";
import users from './users';
import caches from './caches';
import userStore from './userStore';
import sayStore from './sayStore';
import { getJsonCopy, compareJson } from "../utils";

export default class Watchers {

    private prevList: Array<UserType> = [];
    private prevCache: Array<CacheType> = [];

    cacheWatcher(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (!caches.compare(this.prevCache)) {
                console.log('!cache changed!');
                caches.save().then((result) => {
                    if (result) {
                        this.prevCache = getJsonCopy(caches.getCaches);
                        let newHear: Array<SayType> = [];
                        caches.getIdSet().forEach(e => {
                            const found = caches.getCaches.find(ee => ee.id === e);
                            if (found && found.says) {
                                newHear = [...found.says, ...newHear];
                            }
                        });
                        sayStore.setHear(newHear);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
            } else {
                resolve(false);
            }
        });
    }

    sayWatcher(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const currentUser = userStore.getUser;
            const says = sayStore.getSays;
            if (says.length > 0 && currentUser) {
                console.log('!say changed!');
                const tgt = caches.getCaches.find(e => e.id === currentUser.serial);
                if (tgt && tgt.says) {
                    console.log('cache update', tgt);
                    tgt.timestamp = Date.now();
                    says.forEach((say: SayType) => {
                        const foundId = tgt.says.find(e => e.id === say.id);
                        if (!foundId) {
                            tgt.says.push(say);
                        }
                    });
                } else {
                    console.log('cache new');
                    caches.add({
                        id: currentUser.serial, timestamp: Date.now(), says: [...says]
                    });
                }
                sayStore.setSays([]);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    userListWatcher(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (!users.compare(this.prevList)) {
                users.save().then((result) => {
                    if (result) {
                        console.log('user list saved!');
                        const currentUser = userStore.currentUser;
                        if (currentUser) {
                            const found = users.find(currentUser.serial);
                            if (found && (found.update > currentUser.update || !compareJson(found, currentUser))) {
                                const copy = Object.assign({}, found);
                                userStore.setUser(copy);
                                console.log('current user update');
                            }
                        }
                        this.prevList = getJsonCopy(users.getUsers);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
            } else {
                resolve(false);
            }
        });
    }

}