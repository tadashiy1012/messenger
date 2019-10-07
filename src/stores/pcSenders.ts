import clientId from './clientId';
import { CacheType, UserType } from "../types";
import users from './users';
import caches from './caches';
import { getJsonCopy } from '../utils';

export default class Senders {

    private beforeCacheSend: number = -1;
    private beforeListSend: number = -1;
    private prevCache: Array<CacheType> = [];
    private prevUsers: Array<UserType> = [];

    cacheSender(dc: RTCDataChannel): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const cache = caches.getCaches;
            this.prevCache = getJsonCopy(cache);
            const dts = cache.map(e => e.timestamp).sort();
            if (this.beforeCacheSend < dts[dts.length - 1] 
                || JSON.stringify(cache) !== JSON.stringify(this.prevCache)) {
                console.log(dts, this.beforeCacheSend);
                this.beforeCacheSend = Date.now();
                const json = {
                    from: clientId,
                    sendTime: this.beforeCacheSend,
                    payload: {
                        cache
                    }
                };
                dc.send(JSON.stringify(json))
                console.log('[[send cache]]');
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    userListSender(dc: RTCDataChannel): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const list = users.getUsers;
            const dts = list.map(e => e.update).sort();
            if (this.beforeListSend < dts[dts.length - 1] 
                || JSON.stringify(list) !== JSON.stringify(this.prevUsers)) {
                console.log(dts, this.beforeListSend);
                this.prevUsers = getJsonCopy(list);
                this.beforeListSend = Date.now();
                const json = {
                    from: clientId,
                    sendTime: this.beforeListSend,
                    payload: {
                        userList: list
                    }
                };
                dc.send(JSON.stringify(json));
                console.log('[[send userList]]');
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

}