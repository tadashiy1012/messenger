import { observable } from "mobx";
import { PcStateType } from "../types";

class ConnStateStore {
    
    @observable
    pcAState: PcStateType = {
        target: null,
        connection: 'n/a',
        dataChannel: 'n/a'
    };
    
    @observable
    pcBState: PcStateType = {
        target: null,
        connection: 'n/a',
        dataChannel: 'n/a'
    };

    @observable
    pcCState: PcStateType = {
        target: null,
        connection: 'n/a',
        dataChannel: 'n/a'
    };

}

export default new ConnStateStore();