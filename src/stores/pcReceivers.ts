import { CacheType, UserType, DcPayloadType } from "../types";
import users from './users';
import caches from './caches';

export default class Receivers {

    cacheReceiver(payload: DcPayloadType): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (payload && payload.cache) {
                console.log('<<received cache>>', payload.cache);
                payload.cache.forEach((e: CacheType) => {
                    const found = caches.find(e.id);
                    if (found) {
                        if (found.timestamp <= e.timestamp) {
                            const copyCache = Object.assign({}, found, e);
                            const newSays = new Set([...copyCache.says]);
                            copyCache.says = Array.from(newSays);
                            caches.update(copyCache);
                            console.log('(( cache update! ))');
                        }
                    } else {
                        caches.add(e);
                        console.log('(( new cache added! ))');
                    }
                });
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    usersReceiver(payload: DcPayloadType): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (payload && payload.userList) {
                console.log('<<received userList>>', payload.userList);
                payload.userList.forEach((e: UserType) => {
                    const found = users.find(e.serial);
                    if (found) {
                        if (found.update < e.update) {
                            users.update(e);
                            console.log('(( user list update! ))');
                        }
                    } else {
                        users.add(e);
                        console.log('(( new user added! ))');
                    }
                });
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
}