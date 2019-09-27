import uuid = require("uuid");
import MyWebSocket from "./MyWebSocket";

export default function makePreOffer(
    clientId: string, pcA: RTCPeerConnection, ws: MyWebSocket
): Promise<string> {
    return new Promise((resolve, reject) => {
        let timer: any | null = null;
        pcA.createOffer().then((offer) => {
            console.log('pcA create offer');
            return pcA!.setLocalDescription(offer);
        }).then(() => {
            console.log('pcA set local desc(offer)');
            const preOffer = uuid.v1();
            const data = {
                id: clientId,
                to: 'any',
                preOffer
            };
            timer = setInterval(() => {
                ws.send(data).then(() => {
                    console.log('pcA send "pre" offer')
                    clearInterval(timer);
                }).catch((err) => {
                    console.error(err);
                    console.log('pending send pre offer');
                });
            }, 1000);
            resolve(preOffer);
        }).catch((err) => {
            reject(err);
        });
    });
    
}