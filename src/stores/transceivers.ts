import clientId from './clientId';
import { WsPayloadType, PcStateType } from "../types";
import { MyWebSocket } from "../utils";

export default class Transceivers {

    constructor(
        private getWs: () => MyWebSocket | null,
        private getPc: (category: string) => RTCPeerConnection | null,
        private getCdQueue: (category: string) => RTCIceCandidate[],
        private getPcState: () => [PcStateType, PcStateType, PcStateType],
        private getPOffer: () => string | null,
        private resetPOffer: () => void,
    ) {}

    preOfferTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const ws = this.getWs();
            const {id, to, preOffer} = payload;
            if (id !== clientId && to === 'any') {
                console.log('# message for all');
                if (preOffer) {
                    const pendingTime = Math.floor(Math.random() * 5000 + 1000);
                    console.log('pending.. ' + pendingTime + 'msec');
                    setTimeout(() => {
                        console.log('receive pre offer');
                        const data = {
                            id: clientId,
                            to: id,
                            preAnswer: preOffer
                        };
                        ws!.send(data).then(() => {
                            console.log('send pre answer');
                        }).catch(err => console.error(err));
                    }, pendingTime);
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    offerTansceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const ws = this.getWs();
            const pc = this.getPc('A');
            const preOffer = this.getPOffer();
            const {id, to, preAnswer} = payload;
            if (id !== clientId && to === clientId && preAnswer && preAnswer === preOffer) {
                console.log('receive pre answer', preOffer);
                const data = {
                    id: clientId,
                    to: id,
                    offer: pc!.localDescription!.sdp
                };
                ws!.send(data).then(() => {
                    this.resetPOffer();
                    console.log('pcA send offer');
                }).catch(err => console.error(err));
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    answerTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const ws = this.getWs();
            const pcA = this.getPc('A');
            const cdQueueA = this.getCdQueue('A');
            const {id, to, pc, answer} = payload;
            if (id !== clientId && to === clientId && answer) {
                console.log('pc <<', pc, ':', id);
                if (pcA && pcA.remoteDescription === null) {
                    const desc = new RTCSessionDescription({
                        type: 'answer',
                        sdp: answer
                    });
                    this.getPcState()[0].target = id;
                    pcA.setRemoteDescription(desc).catch((err) => console.error(err));
                    console.log('pcA set answer');
                    cdQueueA.forEach(e => {
                        const data = {
                            id: clientId,
                            to: id,
                            pc: pc,
                            candidate: e
                        };
                        ws!.send(data).then(() => {
                            console.log('send pcA candidate');
                        }).catch(err => console.error(err));
                    });
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    candidateTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const pcA = this.getPc('A');
            const pcB = this.getPc('B');
            const pcC = this.getPc('C');
            const {id, to, pc, candidate} = payload;
            if (id !== clientId && to === clientId && candidate && pc) {
                const cd = new RTCIceCandidate({
                    candidate: candidate.candidate,
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    sdpMid: candidate.sdpMid
                });
                if (id === this.getPcState()[0].target && pc == 'A' && pcA) {
                    console.log('pcA add candidate', pc);
                    pcA.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else if (id === this.getPcState()[1].target && pc == 'B' && pcB) {
                    console.log('pcB add candidate', pc);
                    pcB.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else if (id === this.getPcState()[2].target && pc == 'C' && pcC) {
                    console.log('pcC add candidate', pc);
                    pcC.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        });
    }

    pcBCTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const ws = this.getWs();
            const pcB = this.getPc('B');
            const pcC = this.getPc('C');
            const cdQueueB = this.getCdQueue('B');
            const cdQueueC = this.getCdQueue('C');
            const {id, to, offer} = payload;
            if (id !== clientId && to === clientId && offer 
                    && pcB && pcB.remoteDescription === null) {
                this.getPcState()[1].target = id;
                let answer: RTCSessionDescriptionInit | null = null;
                const offerDesc = new RTCSessionDescription({
                    type: 'offer',
                    sdp: offer
                });
                pcB!.setRemoteDescription(offerDesc).then(() => {
                    console.log('pcB set remote desc(received offer)');
                    return pcB!.createAnswer();
                }).then((desc) => {
                    answer = desc;
                    return pcB!.setLocalDescription(desc);
                }).then(() => {
                    console.log('pcB set local desc(pcB answer)')
                    const data = {
                        id: clientId,
                        to: id,
                        pc: 'B',
                        answer: answer!.sdp
                    };
                    ws!.send(data).then(() => {
                        console.log('send pcB answer');
                    }).catch((err) => console.error(err));
                    cdQueueB.forEach(e => {
                        const data = {
                            id: clientId,
                            to: id,
                            pc: 'A',
                            candidate: e
                        };
                        ws!.send(data).then(() => {
                            console.log('send pcB candidate');
                        }).catch(err => console.error(err));
                    });
                    resolve(true);
                }).catch((err) => console.error(err));
            } else if (id !== clientId && to === clientId && offer 
                    && pcC && pcC.remoteDescription === null) {
                this.getPcState()[2].target = id;
                let answer: RTCSessionDescriptionInit | null = null;
                const offerDesc = new RTCSessionDescription({
                    type: 'offer',
                    sdp: offer
                });
                pcC!.setRemoteDescription(offerDesc).then(() => {
                    console.log('pcC set remote desc(received offer)');
                    return pcC!.createAnswer();
                }).then((desc) => {
                    answer = desc;
                    return pcC!.setLocalDescription(desc);
                }).then(() => {
                    console.log('pcC set local desc(pcC answer)')
                    const data = {
                        id: clientId,
                        to: id,
                        pc: 'C',
                        answer: answer!.sdp
                    };
                    ws!.send(data).then(() => {
                        console.log('send pcC answer');
                    }).catch((err) => console.error(err));
                    cdQueueC.forEach(e => {
                        const data = {
                            id: clientId,
                            to: id,
                            pc: 'A',
                            candidate: e
                        };
                        ws!.send(data).then(() => {
                            console.log('send pcC candidate');
                        }).catch(err => console.error(err));
                    });
                    resolve(true);
                }).catch((err) => console.error(err));
            } else {
                resolve(false);
            }
        });
    }

}