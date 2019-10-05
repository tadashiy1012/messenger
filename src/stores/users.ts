import { observable, computed, action } from "mobx";
import { UserType } from "../types";
import * as localForage from 'localforage';

class Users {

    @observable
    private list: UserType[] = [];

    @computed
    public get getUsers(): UserType[] {
        return this.list;
    }

    @action
    public set setUsers(users: UserType[]) {
        this.list = users;
    }

    @action
    public add(user: UserType) {
        this.list.push(user);
    }

    @action
    public remove(index: number) {
        this.list.splice(index, 1);
    }

    @action
    public update(user: UserType): Boolean {
        const found = this.list.find((e) => e.serial === user.serial);
        if (found) {
            const idx = this.list.indexOf(found);
            this.list.splice(idx, 1, user);
            return true;
        } else {
            return false;
        }
    }

    @action
    public replaceAll(users: UserType[]) {
        this.list.splice(0, this.list.length, ...users);
    }

    public indexOf(user: UserType): number {
        return this.list.indexOf(user);
    }

    public find(user: UserType): UserType | undefined {
        return this.list.find(e => e.serial === user.serial);
    }

    public compare(target: UserType[]): Boolean {
        return JSON.stringify(this.list) === JSON.stringify(target);
    }

    public save(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            (async () => {
                const copy = [...this.list.map(e => {
                    const inner = Object.assign({}, e);
                    (Object.keys(inner) as Array<keyof typeof inner>).forEach((key) => {
                        if (inner[key] instanceof Array) {
                            (inner[key] as Array<any>) = [...(inner[key] as Array<any>)];
                        }
                    });
                    return inner;
                })];
                try {
                    await localForage.setItem('user_list', copy);
                } catch (error) {
                    reject(error);
                }
                resolve(true);
            })();
        });
    }

    public load(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    this.list = await localForage.getItem<UserType[]>('user_list') || [];
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

export default new Users();