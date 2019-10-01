import { CacheType } from "../types";

export default class Senders {

    constructor(
        private clientId: string,
        private getCache: () => Array<CacheType>,
    ) {}

    cacheSender(dc: RTCDataChannel): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const cache = this.getCache();
            const json = {
                from: this.clientId,
                sendTime: Date.now(),
                payload: {
                    cache
                }
            };
            dc.send(JSON.stringify(json))
            resolve(true);
        });
    }

}