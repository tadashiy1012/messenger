import { CacheType } from "../types";

export default class Senders {

    constructor(
        private clientId:string,
        private cache: Array<CacheType>,
    ) {}

    cacheSender(dc: RTCDataChannel): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const json = {
                from: this.clientId,
                sendTime: Date.now(),
                payload: {
                    cache: this.cache
                }
            };
            dc.send(JSON.stringify(json))
            resolve(true);
        });
    }

}