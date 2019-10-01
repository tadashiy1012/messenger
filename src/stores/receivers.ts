import * as localForage from 'localforage';
import { CacheType, UserType } from "../types";

export default class Receivers {

    constructor(
        private getCache:() => Array<CacheType>,
        private getUsers:() => Array<UserType>
    ) {}

    cacheReceiver(payload: any): Promise<[Boolean, [Array<CacheType> | null, Array<UserType> | null]]> {
        return new Promise((resolve, reject) => {
            if (payload && payload.cache) {
                console.log('<<received cache>>', this.getCache(), payload.cache);
                const cache = this.getCache();
                payload.cache.forEach((e: CacheType) => {
                    const found = cache.find(ee => ee.id == e.id);
                    if (found) {
                        if (found.timestamp < e.timestamp) {
                            const idx = cache.indexOf(found);
                            cache.splice(idx, 1, e);
                            console.log('(( cache update! ))');
                        }
                    } else {
                        cache.push(e);
                        console.log('(( new cache added! ))')
                    }
                });
                resolve([true, [cache, null]]);
            } else {
                resolve([false, [null, null]]);
            }
        });
    }

    usersReceiver(payload: any): Promise<[Boolean, [Array<CacheType> | null, Array<UserType> | null]]> {
        return new Promise((resolve, reject) => {
            if (payload && payload.userList) {
                console.log('<<received userList>>');
                const users = this.getUsers();
                payload.userList.forEach((e: UserType) => {
                    const found = users.find(ee => ee.serial === e.serial);
                    if (found) {
                        if (found.update < e.update) {
                            const idx = users.indexOf(found);
                            users.splice(idx, 1, e);
                            console.log('(( user list update! ))');
                        }
                    } else {
                        users.push(e);
                        console.log('(( new user added! ))');
                    }
                });
                localForage.setItem('user_list', users)
                    .catch(err => console.error(err));
                resolve([true, [null, users]]);
            } else {
                resolve([false, [null, null]]);
            }
        });
    }
}