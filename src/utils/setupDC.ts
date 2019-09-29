import * as localForage from 'localforage';
import { SayType, UserType, CacheType } from "../types";

export default function setupDC(
    clientId: string, cache: Array<CacheType>, userList: Array<UserType>,
    dc: RTCDataChannel, stateCb: (state: RTCDataChannelState) => void
): RTCDataChannel {
    dc.onopen = (ev) => {
        console.log(ev, dc.readyState);
        stateCb(dc.readyState);
        const json = {
            from: clientId,
            sendTime: Date.now(),
            payload: {
                cache: cache
            }
        };
        dc.send(JSON.stringify(json))
    };
    dc.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        console.log(ev, data);
        const {from, sendTime, payload} = data;
        if (from && payload && payload.cache) {
            console.log('<<received cache>>', from);
            payload.cache.forEach((e: CacheType) => {
                const found = cache.find(ee => ee.id == e.id);
                if (found) {
                    if (found.timestamp < e.timestamp) {
                        const idx = cache.indexOf(found);
                        cache.splice(idx, 1, e);
                        console.log('(( cache update! ))');
                    }
                } else {
                    cache.push(e);
                    console.log('(( new cache added! ))')
                }
            });
        } else if (from && payload && payload.userList) {
            console.log('<<received userList>>', from);
            payload.userList.forEach((e: UserType) => {
                const found = userList.find(ee => ee.serial === e.serial);
                if (found) {
                    if (found.update < e.update) {
                        const idx = userList.indexOf(found);
                        userList.splice(idx, 1, e);
                        console.log('(( user list update! ))');
                    }
                } else {
                    userList.push(e);
                    console.log('(( new user added! ))');
                }
            });
            (async () => {
                try {
                    await localForage.setItem('user_list', userList);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    };
    dc.onclose = (ev) => {
        console.log(ev, dc.readyState);
        stateCb(dc.readyState);
    };
    dc.onerror = (ev) => {
        console.error(ev);
    };
    return dc;
}