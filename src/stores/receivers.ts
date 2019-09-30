import * as localForage from 'localforage';
import { CacheType, UserType } from "../types";

export default class Receivers {

    constructor(
        private cache: Array<CacheType>,
        private users: Array<UserType>
    ) {}

    cacheReceiver(payload: any): Promise<[Boolean, [Array<CacheType> | null, Array<UserType> | null]]> {
        return new Promise((resolve, reject) => {
            if (payload && payload.cache) {
                console.log('<<received cache>>');
                payload.cache.forEach((e: CacheType) => {
                    const found = this.cache.find(ee => ee.id == e.id);
                    if (found) {
                        if (found.timestamp < e.timestamp) {
                            const idx = this.cache.indexOf(found);
                            this.cache.splice(idx, 1, e);
                            console.log('(( cache update! ))');
                        }
                    } else {
                        this.cache.push(e);
                        console.log('(( new cache added! ))')
                    }
                });
                resolve([true, [this.cache, null]]);
            } else {
                resolve([false, [null, null]]);
            }
        });
    }

    usersReceiver(payload: any): Promise<[Boolean, [Array<CacheType> | null, Array<UserType> | null]]> {
        return new Promise((resolve, reject) => {
            if (payload && payload.userList) {
                console.log('<<received userList>>');
                payload.userList.forEach((e: UserType) => {
                    const found = this.users.find(ee => ee.serial === e.serial);
                    if (found) {
                        if (found.update < e.update) {
                            const idx = this.users.indexOf(found);
                            this.users.splice(idx, 1, e);
                            console.log('(( user list update! ))');
                        }
                    } else {
                        this.users.push(e);
                        console.log('(( new user added! ))');
                    }
                });
                localForage.setItem('user_list', this.users)
                    .catch(err => console.error(err));
                resolve([true, [null, this.users]]);
            } else {
                resolve([false, [null, null]]);
            }
        });
    }
}