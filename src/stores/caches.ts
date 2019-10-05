import { CacheType, SayType } from "../types";
import * as localForage from 'localforage';
import { observable, computed, action } from "mobx";

class Caches {

    @observable
    private caches: CacheType[] = [];

    @computed
    public get getCaches(): CacheType[] {
        return this.caches;
    }

    @action
    public set setCaches(caches: CacheType[]) {
        this.caches = caches;
    }

    @action
    public add(cache: CacheType) {
        this.caches.push(cache);
    }

    @action
    public remove(index: number) {
        this.caches.splice(index, 1);
    }

    @action
    public update(cache: CacheType): Boolean {
        const found = this.caches.find((e) => e.id === cache.id);
        if (found) {
            const idx = this.caches.indexOf(found);
            this.caches.splice(idx, 1, cache);
            return true;
        } else {
            return false;
        }
    }

    @action
    public replaceAll(caches: CacheType[]) {
        this.caches.splice(0, this.caches.length, ...caches);
    }

    public indexOf(cache: CacheType): number {
        return this.caches.indexOf(cache);
    }

    public find(cache: CacheType): CacheType | undefined {
        return this.caches.find(e => e.id === cache.id);
    }

    public compare(target: CacheType[]): Boolean {
        return JSON.stringify(this.caches) === JSON.stringify(target);
    }

    public save(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            (async () => {
                const copy = this.caches.map(e => {
                    const inner = Object.assign({}, e);
                    (Object.keys(inner) as Array<keyof typeof inner>).forEach((key) => {
                        const says = inner[key];
                        if (says instanceof Array) {
                            (inner[key] as SayType[]) = says.map(ee => {
                                const inInner = Object.assign({}, ee);
                                (Object.keys(inInner) as Array<keyof typeof inInner>).forEach((kk) => {
                                    const prop = inInner[kk];
                                    if (prop instanceof Array) {
                                        (inInner[kk] as string[]) = [...prop];
                                    }
                                });
                                return inInner;
                            });
                        }
                    });
                    return inner;
                });
                console.log(copy);
                try {
                    await localForage.setItem('user_message_cache', copy);
                } catch (error) {
                    reject(error);
                }
                resolve(true);
            })();
        });
    }

    public load(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            (async() => {
                try {
                    this.caches = await localForage.getItem('user_message_cache') || [];   
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            })();
        });
    }

    constructor() {
        this.load().catch(err => console.error(err));
    }

}

export default new Caches();