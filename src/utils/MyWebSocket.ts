import { WEB_SOCKET_USER, APP_NAME, VERSION } from "../const";

export default class MyWebSocket {
    private ws: WebSocket;
    constructor(url: string) {
        this.ws = new WebSocket(url)
    }
    setOnOpenHandler(handler: (ev: Event) => void) {
        this.ws.onopen = (ev) => {
            handler(ev);
        };
    }
    setOnMessageHandler(handler: (ev: MessageEvent) => void) {
        this.ws.onmessage = (ev) => {
            handler(ev);
        };
    }
    setOnErrorHandler(handler: (ev: Event) => void) {
        this.ws.onerror = (ev) => {
            handler(ev);
        };
    }
    send(data: object): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            const json = {
                to: WEB_SOCKET_USER,
                app: APP_NAME + '@' + VERSION,
                payload: data
            };
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(json));
                resolve(true);
            } else {
                reject(new Error('websocket error'));
            }
        });
    }
    sendLaw(data: string) {
        this.ws.send(data);
    }
}
