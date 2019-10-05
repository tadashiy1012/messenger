import { observable, computed } from "mobx";
import { SayType } from "../types";
import clientId from './clientId';
import users from './users';
import userStore from './userStore';

class SayStore {

    private say: Array<SayType> = [];
    
    @observable 
    private hear: Array<SayType> = [];

    public get getSay(): SayType[] {
        return this.say;
    }

    public addSay(say: SayType): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            console.log('$say:', say);
            if (userStore.currentUser) {
                const currentSerial = userStore.currentUser.serial;
                const found = users.getUsers.find(e => e.serial === currentSerial);
                if (found && found.clientId === clientId) {
                    this.say.push(say);
                    resolve(true);
                } else {
                    reject(new Error('login state error!!'));
                }
            } else {
                reject(new Error('login state error!!'));
            }
        });
    }

    @computed
    public get getHear(): SayType[] {
        return this.hear;
    }

    @computed
    public get timeLine(): Array<SayType> {
        const says = this.hear.filter((e, idx, self) => {
            const len = self.filter(ee => ee.id === e.id).length;
            return len > 0;
        });
        return says.sort((a, b) => {
            return a.date - b.date
        });
    }

}

export default new SayStore();