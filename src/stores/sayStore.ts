import { observable, computed, action } from "mobx";
import { SayType } from "../types";
import caches from './caches';

class SayStore {

    private says: Array<SayType> = [];
    
    @observable 
    private hear: Array<SayType> = [];

    public get getSays(): SayType[] {
        return this.says;
    }

    public addSay(say: SayType) {
        console.log('$say:', say);
        this.says.push(say);
    }

    public updateSay(say: SayType): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const tgtCache = caches.getCaches.find(e => e.id === say.authorId);
            if (tgtCache) {
                const tgtSay = tgtCache.says.find(e => e.id === say.id);
                if (tgtSay) {
                    tgtSay.like = say.like;
                    tgtSay.reply = say.reply;
                    resolve(true);
                } else {
                    reject(new Error('target say not found'));
                }
            } else {
                reject(new Error('target cache not found'));
            }
        });
    }

    @computed
    public get getHear(): SayType[] {
        return this.hear;
    }

    @action
    public setHear(hear: SayType[]) {
        this.hear = hear;
    }

    @computed
    public get timeLine(): Array<SayType> {
        const filtered = this.hear.filter((e, idx, self) => {
            const len = self.filter(ee => ee.id === e.id).length;
            return len > 0;
        });
        return filtered.sort((a, b) => {
            return a.date - b.date
        });
    }

}

export default new SayStore();