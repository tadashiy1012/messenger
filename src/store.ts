import {observable, computed, action} from 'mobx';
import * as uuid from 'uuid';
import {PCBuilder} from './makePC';

class MyStore {
   
    readonly id: string = uuid.v1();

    @observable
    name: string = 'no name';

    @action
    set setName(name: string) {
        this.name = name;
    }

    @observable
    say: Array<string> = [];
    @observable
    hear: Array<string> = [];

    @action
    addSay(say: string) {
        this.say.push(say);
    }

    @observable
    ws: WebSocket | null = null;

    @action
    createWs() {
        const _ws = new WebSocket('wss://cloud.achex.ca');
        _ws.onopen = (ev) => {
            console.log(ev);
            const auth = {auth: 'default@890', passowrd: '19861012'};
            _ws.send(JSON.stringify(auth));
        };
        _ws.onmessage = (ev) => {
            console.log(ev);
        };
        _ws.onerror = (ev) => {
            console.log(ev);
        };
        this.ws = _ws;
    }

    @observable
    pcA: RTCPeerConnection | null = null;
    @observable
    pcB: RTCPeerConnection | null = null;
    @observable
    pcC: RTCPeerConnection | null = null;
    @observable
    dcA: RTCDataChannel | null = null;
    @observable
    dcB: RTCDataChannel | null = null;
    @observable
    dcC: RTCDataChannel | null = null;

    @action
    createPCA() {
        this.pcA = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(ev);
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(ev);
        })
        .setOnIcecandidate((ev) => {
            console.log(ev);
        })
        .setOnDataChannel((ev: RTCDataChannelEvent) => {
            console.log(ev);
            this.dcA = ev.channel;
        })
        .build();
    }

    @action
    createPCB() {
        this.pcB = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(ev);
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(ev);
        })
        .setOnIcecandidate((ev) => {
            console.log(ev);
        })
        .build();
        if (this.pcB !== null) {
            this.dcB = this.pcB.createDataChannel('chat');
        }
    }
    
    @action
    createPCC() {
        this.pcC = PCBuilder.builder()
        .setOnNegotiationNeeded((ev) => {
            console.log(ev);
        })
        .setOnIceGatheringStateChange((ev) => {
            console.log(ev);
        })
        .setOnIcecandidate((ev) => {
            console.log(ev);
        })
        .build();
        if (this.pcC !== null) {
            this.dcC = this.pcC.createDataChannel('chat');
        }
    }

}

type MyStoreType = {
    id: string
    name: string
    say: Array<string>
    hear: Array<string>
    ws: WebSocket | null
    pcA: RTCPeerConnection | null
    pcB: RTCPeerConnection | null
    pcC: RTCPeerConnection | null
    dcA: RTCDataChannelEvent | null
    dcB: RTCDataChannelEvent | null
    dcC: RTCDataChannelEvent | null
    setName: (name: string) => void
    addSay: (say: string) => void
    createWs: () => void
    createPCA: () => void
    createPCB: () => void
    createPCC: () => void
}

export {
    MyStore, MyStoreType
};