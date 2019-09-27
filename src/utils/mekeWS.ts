import { WEB_SOCKET_USER, VERSION, APP_NAME, WEB_SOCKET_URL, WEB_SOCKET_PASSWORD } from "../const";
import MyWebSocket from "./MyWebSocket";

export default function makeWs (...messageHandlers: Array<(payload: any) => Promise<Boolean>>): Promise<MyWebSocket> {
    return new Promise((resolve, reject) => {
        const ws = new MyWebSocket(WEB_SOCKET_URL);
        ws.setOnOpenHandler((ev) => {
            console.log(ev);
            const auth = {auth: WEB_SOCKET_USER, passowrd: WEB_SOCKET_PASSWORD};
            ws.sendLaw(JSON.stringify(auth));
            resolve(ws);
        });
        ws.setOnMessageHandler((ev) => {
            const data = JSON.parse(ev.data);
            console.log(data);
            const {app} = data;
            if (app && app === (APP_NAME + '@' + VERSION) && data.payload) {
                const tasks = messageHandlers.map((handler) => handler(data.payload));
                Promise.all(tasks).then((results) => {
                    console.log(results);
                    const filtered = results.filter(e => e === true);
                    if (filtered.length === 0) {
                        console.log('[less than condition]');
                    }
                }).catch((err) => console.error(err));
            }
        });
        ws.setOnErrorHandler((ev) => { console.error(ev); });
    });
}