import * as localForage from 'localforage';
import { CacheType, UserType } from "../types";
import users from './users';
import caches from './caches';

export default class Receivers {

    cacheReceiver(payload: any): Promise<[Boolean, [Array<CacheType> | null, Array<UserType> | null]]> {
        return new Promise((resolve, reject) => {
            if (payload && payload.cache) {
                const cache: Array<CacheType> = JSON.parse(JSON.stringify(caches.getCaches));
                console.log('<<received cache>>', cache, payload.cache);
                payload.cache.forEach((e: CacheType) => {
                    const found = cache.find(ee => ee.id == e.id);
                    if (found) {
                        if (found.timestamp <= e.timestamp) {
                            const idx = cache.indexOf(found);
                            const newCache = Object.assign({}, cache[idx], e);
                            if (JSON.stringify(newCache.says) !== JSON.stringify(found.says) && newCache.says.length > found.says.length) {
                                const newSays = new Set([...found.says, ...newCache.says]);
                                newCache.says = Array.from(newSays);
                            }
                            cache.splice(idx, 1, newCache);
                            console.log('(( cache update! ))');
                        } else {
                            console.log('(( cache not update! ))')
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
                const list: Array<UserType> = JSON.parse(JSON.stringify(users.getUsers));
                payload.userList.forEach((e: UserType) => {
                    const found = list.find(ee => ee.serial === e.serial);
                    if (found) {
                        if (found.update < e.update) {
                            const idx = list.indexOf(found);
                            list.splice(idx, 1, e);
                            console.log('(( user list update! ))');
                        }
                    } else {
                        list.push(e);
                        console.log('(( new user added! ))');
                    }
                });
                resolve([true, [null, list]]);
            } else {
                resolve([false, [null, null]]);
            }
        });
    }
}