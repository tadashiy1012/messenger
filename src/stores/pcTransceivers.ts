import clientId from './clientId';
import { WsPayloadType, PcStateType } from "../types";
import { MyWebSocket } from "../utils";
import connStateStore from './connStateStore';
import pcStore from './pcStore';

export default class Transceivers {

    preOfferTransceiver(payload: WsPayloadType) {
        return new Promise<Boolean>((resolve) => {
            const ws = pcStore.getWs();
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
            const ws = pcStore.getWs();
            const pc = pcStore.getPc('A');
            const preOffer = pcStore.getPreOffer();
            const {id, to, preAnswer} = payload;
            if (id !== clientId && to === clientId && preAnswer && preAnswer === preOffer) {
                console.log('receive pre answer', preOffer);
                const data = {
                    id: clientId,
                    to: id,
                    offer: pc!.localDescription!.sdp
                };
                ws!.send(data).then(() => {
                    pcStore.clearPreOffer();
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
            const ws = pcStore.getWs();
            const pcA = pcStore.getPc('A');
            const cdQueueA = pcStore.getQueue('A');
            const {id, to, pc, answer} = payload;
            if (id !== clientId && to === clientId && answer) {
                console.log('pc <<', pc, ':', id);
                if (pcA && pcA.remoteDescription === null) {
                    const desc = new RTCSessionDescription({
                        type: 'answer',
                        sdp: answer
                    });
                    connStateStore.pcAState.target = id;
                    pcA.setRemoteDescription(desc).catch((err) => console.error(err));
                    console.log('pcA set answer');
                    cdQueueA!.forEach(e => {
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
                    pcStore.clearQueue('A');
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
            const pcA = pcStore.getPc('A');
            const pcB = pcStore.getPc('B');
            const pcC = pcStore.getPc('C');
            const {id, to, pc, candidate} = payload;
            if (id !== clientId && to === clientId && candidate && pc) {
                const cd = new RTCIceCandidate({
                    candidate: candidate.candidate,
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    sdpMid: candidate.sdpMid
                });
                if (id === connStateStore.pcAState.target && pc == 'A' && pcA) {
                    console.log('pcA add candidate', pc);
                    pcA.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else if (id === connStateStore.pcBState.target && pc == 'B' && pcB) {
                    console.log('pcB add candidate', pc);
                    pcB.addIceCandidate(cd).catch((err) => console.error(err));
                    resolve(true);
                } else if (id === connStateStore.pcCState.target && pc == 'C' && pcC) {
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
            const ws = pcStore.getWs();
            const pcB = pcStore.getPc('B');
            const pcC = pcStore.getPc('C');
            const cdQueueB = pcStore.getQueue('B');
            const cdQueueC = pcStore.getQueue('C');
            const {id, to, offer} = payload;
            if (id !== clientId && to === clientId && offer 
                    && pcB && pcB.remoteDescription === null) {
                connStateStore.pcBState.target = id;
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
                    cdQueueB!.forEach(e => {
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
                    pcStore.clearQueue('B')
                    resolve(true);
                }).catch((err) => console.error(err));
            } else if (id !== clientId && to === clientId && offer 
                    && pcC && pcC.remoteDescription === null) {
                connStateStore.pcCState.target = id;
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
                    cdQueueC!.forEach(e => {
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
                    pcStore.clearQueue('C');
                    resolve(true);
                }).catch((err) => console.error(err));
            } else {
                resolve(false);
            }
        });
    }

}