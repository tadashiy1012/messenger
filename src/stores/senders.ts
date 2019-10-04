import clientId from './clientId';
import { CacheType, UserType } from "../types";

export default class Senders {

    private beforeCacheSend: number = -1;
    private beforeListSend: number = -1;
    private prevCache: Array<CacheType> = [];
    private prevUsers: Array<UserType> = [];

    constructor(
        private getCache: () => Array<CacheType>,
        private getUsers: () => Array<UserType>
    ) {}

    cacheSender(dc: RTCDataChannel): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const cache = this.getCache();
            this.prevCache = JSON.parse(JSON.stringify(cache));
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
            const users = this.getUsers();
            const dts = users.map(e => e.update).sort();
            if (this.beforeListSend < dts[dts.length - 1] 
                || JSON.stringify(users) !== JSON.stringify(this.prevUsers)) {
                console.log(dts, this.beforeListSend);
                this.prevUsers = JSON.parse(JSON.stringify(users));
                this.beforeListSend = Date.now();
                const json = {
                    from: clientId,
                    sendTime: this.beforeListSend,
                    payload: {
                        userList: users
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