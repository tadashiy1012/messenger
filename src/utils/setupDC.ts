import * as localForage from 'localforage';
import { SayType, UserType, CacheType } from "../types";

export default function setupDC(
    clientId: string, cache: Array<CacheType>, userList: Array<UserType>,
    dc: RTCDataChannel, stateCb: (state: RTCDataChannelState) => void
): RTCDataChannel {
    dc.onopen = (ev) => {
        console.log(ev, dc.readyState);
        stateCb(dc.readyState);
        cache.forEach(e => {
            const json = {
                from: clientId,
                origin: e.says[0].authorId,
                payload: {
                    cache: e.says
                }
            };
            dc.send(JSON.stringify(json))
        });
        const json = {
            from: clientId,
            payload: {
                userList: userList
            }
        };
        dc.send(JSON.stringify(json));
    };
    dc.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        console.log(ev, data);
        const {from, origin, sendTime, payload} = data;
        if (from && origin && payload && payload.cache) {
            console.log('<<received cache>>', from);
            const tgt = cache.find(e => e.id === origin);
            if (tgt) {
                if (tgt.says && payload.cache) {
                    console.log('>>tgt found!<<', tgt);
                    let update = false;
                    payload.cache.forEach((say: SayType) => {
                        const foundId = tgt.says.find(e => e.id === say.id);
                        if (!foundId) {
                            console.log ('>>>push say<<<')
                            tgt.says.push(say);
                            update = true;
                        }
                    });
                    if (update) {
                        tgt.timestamp = Date.now();
                    }
                }
            } else {
                cache.push({
                    id: origin, timestamp: Date.now(), says: payload.cache
                });
            }
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