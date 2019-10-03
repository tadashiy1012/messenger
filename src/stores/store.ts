import {observable, computed, action, observe} from 'mobx';
import * as localForage from 'localforage';
import * as uuid from 'uuid';
import * as bcrypt from 'bcryptjs';
import { SayType, UserType, CacheType, PcStateType } from '../types';
import { noImage } from '../utils/noImageIcon';
import { ShowMode } from '../enums';
import PcStore from './pcStore';

export default class MyStore {

    private pcStore: PcStore | null = null;
   
    @observable
    id: string = uuid.v1();

    @observable
    currentUser: UserType | null = null;

    @computed
    get getUser(): UserType | null {
        return this.currentUser;
    }

    private userNormalize(user: UserType): UserType {
        user.follow = [...user.follow];
        user.follower = [...user.follow];
        user.like = [...user.like];
        return user;
    }

    @action
    updateUser(name: string, icon?: string, password?: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const user = Object.assign({}, this.getUser);
                user.name = name;
                user.icon = icon || noImage;
                if (password) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);
                    user.password = hash;
                }
                this.userNormalize(user);
                user.update = Date.now();
                this.currentUser = user;
                const found = this.userList.find(e => e.serial === this.currentUser!.serial);
                if (found) {
                    const idx = this.userList.indexOf(found);
                    const user = Object.assign({}, this.getUser);
                    if (user) {
                        this.userList.splice(idx, 1, user);
                    }
                    resolve(true);
                } else {
                    const user = Object.assign({}, this.getUser);
                    if (user) {
                        this.userList.push(user);
                    }
                    resolve(true);
                }
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    updateUserFollow(tgtSerial: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const user = Object.assign({}, this.getUser);
                user.follow = [...user.follow, tgtSerial];
                this.userNormalize(user);
                user.update = Date.now();
                this.currentUser = user;
                const found = this.userList.find(e => e.serial === this.currentUser!.serial);
                if (found) {
                    const idx = this.userList.indexOf(found);
                    this.userList.splice(idx, 1, user);
                } else {
                    reject(new Error('user not found'));
                }
                const found2 = this.userList.find(e => e.serial === tgtSerial);
                if (found2) {
                    const idx2 = this.userList.indexOf(found2);
                    const user2 = Object.assign({}, found2);
                    user2.follower = [...user2.follower, user.serial];
                    user2.update = Date.now();
                    this.userList.splice(idx2, 1, user2);
                } else {
                    reject(new Error('follow target user not found'));
                }
                resolve(true);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    updateUserUnFollow(tgtSerial: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const user = Object.assign({}, this.getUser);
                user.follow = [...user.follow.filter(e => e !== tgtSerial)];
                this.userNormalize(user);
                user.update = Date.now();
                this.currentUser = user;
                const found = this.userList.find(e => e.serial === this.currentUser!.serial);
                if (found) {
                    const idx = this.userList.indexOf(found);
                    this.userList.splice(idx, 1, user);
                } else {
                    reject(new Error('user not found'));
                }
                const found2 = this.userList.find(e => e.serial === tgtSerial);
                if (found2) {
                    const idx2 = this.userList.indexOf(found2);
                    const user2 = Object.assign({}, found2);
                    user2.follower = [...user2.follower.filter(e => e !== user.serial)];
                    user2.update = Date.now();
                    this.userList.splice(idx2, 1, user2);
                } else {
                    reject(new Error('follow target user not found'));
                }
                resolve(true);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    updateUserLike(tgtSay: SayType): Promise<Boolean> {
        console.log(tgtSay);
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const copySay = Object.assign({}, tgtSay);
                const copyUser = Object.assign({}, this.getUser);
                const foundLike = copyUser.like.find(e => e === copySay.id);
                const foundLiker = copySay.like.find(e => e === copyUser.serial);
                if (foundLike || foundLiker) {
                    resolve(false);
                }
                copyUser.like = [...copyUser.like, copySay.id];
                this.userNormalize(copyUser);
                copyUser.update = Date.now();
                copySay.like = [...copySay.like, copyUser.serial];
                copySay.reply = [...copySay.reply];
                const foundUser = this.userList.find(e => e.serial === copyUser.serial);
                if (foundUser) {
                    const idx = this.userList.indexOf(foundUser);
                    this.userList.splice(idx, 1, copyUser);
                } else {
                    reject(new Error('user not found'));
                }
                const cache = this.pcStore!.getCache;
                cache.forEach((e) => {
                    const found = e.says.find((ee) => ee.id === copySay.id);
                    if (found) {
                        const idx = e.says.indexOf(found);
                        e.says.splice(idx, 1, copySay);
                        e.timestamp = Date.now();
                        resolve(true);
                    }
                });
                resolve(false);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    updateUserUnLike(tgtSay: SayType): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const copySay = Object.assign({}, tgtSay);
                const copyUser = Object.assign({}, this.getUser);
                const foundLike = copyUser.like.find(e => e === copySay.id);
                const foundLiker = copySay.like.find(e => e === copyUser.serial);
                if (!foundLike && !foundLiker) {
                    resolve(false);
                }
                copyUser.like.splice(copyUser.like.indexOf(foundLike!), 1);
                copyUser.like = [...copyUser.like];
                this.userNormalize(copyUser);
                copyUser.update = Date.now();
                copySay.like.splice(copySay.like.indexOf(foundLiker!), 1);
                copySay.like = [...copySay.like];
                copySay.reply = [...copySay.reply];
                const foundUser = this.userList.find(e => e.serial === copyUser.serial);
                if (foundUser) {
                    const idx = this.userList.indexOf(foundUser);
                    this.userList.splice(idx, 1, copyUser);
                } else {
                    reject(new Error('user not found'));
                }
                const cache = this.pcStore!.getCache;
                cache.forEach((e) => {
                    const found = e.says.find((ee) => ee.id === copySay.id);
                    if (found) {
                        const idx = e.says.indexOf(found);
                        e.says.splice(idx, 1, copySay);
                        e.timestamp = Date.now();
                        resolve(true);
                    }
                });
                resolve(false);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    private say: Array<SayType> = [];
    @observable private hear: Array<SayType> = [];

    addSay(say: SayType): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            console.log('$say:', say);
            if (this.currentUser) {
                const currentSerial = this.currentUser.serial;
                const found = this.userList.find(e => e.serial === currentSerial);
                if (found && found.clientId === this.id) {
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
    get timeLine(): Array<SayType> {
        const says = this.hear.filter((e, idx, self) => {
            const len = self.filter(ee => ee.id === e.id).length;
            return len > 0;
        });
        return says.sort((a, b) => {
            return a.date - b.date
        });
    }
    
    private userList: Array<UserType> = [];

    findAuthorIcon(authorId: string): string {
        const found = this.userList.find(e => e.serial === authorId);
        if (found && found.icon) {
            return found.icon === '' ? noImage : found.icon;
        } else {
            return noImage;
        }
    }

    findAuthorname(authorId: string): string {
        const found = this.userList.find(e => e.serial === authorId);
        if (found && found.name) {
            return found.name
        } else {
            return 'no_name';
        }
    }

    findUser(userSerial: string): UserType | null {
        const found = this.userList.find(e => e.serial === userSerial);
        return found || null
    }

    findUserSay(userSerial: string): Array<SayType> {
        const found = this.pcStore!.getCache.find(e => e.says[0].authorId === userSerial);
        if (found) {
            return found.says;
        } else {
            return [];
        }
    }

    findSay(sayId: string): SayType | undefined {
        const says: Array<SayType> = this.pcStore!.getCache.reduce<SayType[]>((acc, e) => {
           acc.push(...e.says);
           return acc;
        }, []);
        return says.find(e => e.id === sayId);
    }

    @observable
    logged: Boolean = false;

    @action
    setLogged(logged: Boolean) {
        this.logged = logged;
    }

    @action
    login(email: string, password: string): Promise<Boolean> {
        return new Promise((resolve) => {
            const cache = this.pcStore!.getCache;
            const found = this.userList.find(e => e.email === email);
            if (found && bcrypt.compareSync(password, found.password)) {
                this.currentUser = {
                    serial: found.serial,
                    name: found.name,
                    email: found.email,
                    password: found.password,
                    icon: found.icon,
                    follow: found.follow,
                    follower: found.follower,
                    like: found.like,
                    clientId: this.id,
                    update: Date.now()
                };
                found.clientId = this.currentUser.clientId;
                found.update = this.currentUser.update;
                const tgtCache = cache.find(e => e.id === found.serial);
                if (!tgtCache) {
                    cache.push({
                        id: found.serial, timestamp: Date.now(), says: []
                    });
                }
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    @action
    logout(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.setLogged(false);
            if (this.currentUser) {
                const serial = this.currentUser.serial;
                const found = this.userList.find(e => e.serial === serial);
                if (found) {
                    found.clientId = 'no id';
                    found.update = Date.now();
                    this.currentUser = null;
                    this.showMode = ShowMode.MAIN;
                    this.logged = false;
                    resolve(true);
                } else {
                    reject(new Error('user not found'));
                }
            } else {
                reject(new Error('login state error'));
            }
        });
    }

    @action
    registration(name: string, email: string, password: string): Promise<Boolean> {
        return new Promise((resolve) => {
            const filtered = this.userList.filter(e => e.email === email);
            const pass = encodeURI(password);
            if (filtered.length > 0 || pass !== password) {
                resolve(false);
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);
                const user: UserType = {
                    serial: uuid.v1(),
                    name: name,
                    email: email,
                    password: hash,
                    icon: noImage,
                    follow: [],
                    follower: [],
                    like: [],
                    clientId: this.id,
                    update: Date.now()
                };
                this.userList.push(user);
                resolve(true);
            }
        });
    }

    @observable
    showDetail: Boolean = true;

    @action
    setShowDetail(show: Boolean) {
        this.showDetail = show;
    }

    @observable
    showSetting: Boolean = false;

    @action
    setShowSetting(show: Boolean) {
        this.showSetting = show;
    }

    @observable
    showMode: ShowMode = ShowMode.MAIN;

    @action
    setShowMode(mode: ShowMode) {
        this.showMode = mode;
    }

    @observable
    showUserTarget: string | null = null;

    @action
    setShowUserTarget(targetSerial: string | null) {
        this.showUserTarget = targetSerial;
    }

    @observable
    showMessageTarget: string | null = null;

    @action
    setShowMessageTarget(targetId: string | null) {
        this.showMessageTarget = targetId;
    }

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

    @action
    allClear(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.pcStore!.setCache = [];
            this.userList = [];
            localForage.clear().then(() => {
                this.currentUser = null;
                this.showSetting = false;
                this.logged = false;
                resolve(true);
            }).catch((err) => {
                reject(err);
            })
        });
    }

    constructor() {
        (async () => {
            try {
                this.userList = await localForage.getItem<Array<UserType>>('user_list') || [];
            } catch (error) {
                console.error(error);
            }
            this.pcStore = new PcStore(this.id, () => {
                return this.userList;
            }, () => {
                return this.say;
            }, () => {
                return this.hear;
            }, () => {
                return this.getUser;
            }, () => {
                return [this.pcAState, this.pcBState, this.pcCState];
            });
        })();
    }

}