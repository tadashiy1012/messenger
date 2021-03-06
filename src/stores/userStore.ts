import { observable, computed, action } from 'mobx';
import * as uuid from 'uuid';
import * as bcrypt from 'bcryptjs';
import * as localForage from 'localforage';
import { SayType, UserType } from '../types';
import { noImage } from '../utils/noImageIcon';
import clientId from './clientId';
import users from './users';
import caches from './caches';

class UserStore {

    @observable
    currentUser: UserType | null = null;

    @observable
    logged: Boolean = false;

    @computed
    get getUser(): UserType | null {
        return this.currentUser;
    }

    @action
    setUser(user: UserType) {
        this.currentUser = user;
    }

    @action
    updateUser(password: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const user = Object.assign({}, this.getUser);
                if (password) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);
                    user.password = hash;
                }
                user.update = Date.now();
                const result = users.update(user);
                if (!result) {
                    users.add(user);
                }
                this.currentUser = user;
                resolve(true);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    updateUserIcon(icon: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const user = Object.assign({}, this.getUser);
                user.icon = icon;
                user.update = Date.now();
                const result = users.update(user);
                if (!result) {
                    users.add(user);
                }
                this.currentUser = user;
                resolve(true);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    updateUserProfile(prof: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const user = Object.assign({}, this.getUser);
                user.profile = prof;
                user.update = Date.now();
                const result = users.update(user);
                if (!result) {
                    users.add(user);
                }
                this.currentUser = user;
                resolve(true);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    updateUserFollow(tgtSerial: string): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const userA = Object.assign({}, this.getUser);
                userA.follow = [...userA.follow, tgtSerial];
                userA.update = Date.now();
                this.currentUser = userA;
                const found = users.find(this.currentUser.serial);
                if (found) {
                    users.update(userA);
                } else {
                    reject(new Error('user not found'));
                }
                const found2 = users.getUsers.find(e => e.serial === tgtSerial);
                if (found2) {
                    const userB = Object.assign({}, found2);
                    userB.follower = [...userB.follower, userA.serial];
                    userB.update = Date.now();
                    users.update(userB);
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
                const userA = Object.assign({}, this.getUser);
                userA.follow = [...userA.follow.filter(e => e !== tgtSerial)];
                userA.update = Date.now();
                this.currentUser = userA;
                const found = users.find(this.currentUser.serial);
                if (found) {
                    users.update(userA);
                } else {
                    reject(new Error('user not found'));
                }
                const found2 = users.getUsers.find(e => e.serial === tgtSerial);
                if (found2) {
                    const userB = Object.assign({}, found2);
                    userB.follower = [...userB.follower.filter(e => e !== userA.serial)];
                    userB.update = Date.now();
                    users.update(userB);
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
                copyUser.update = Date.now();
                copySay.like = [...copySay.like, copyUser.serial];
                copySay.reply = [...copySay.reply];
                const foundUser = users.find(copyUser.serial);
                if (foundUser) {
                    users.update(copyUser);
                } else {
                    reject(new Error('user not found'));
                }
                const cache = caches.getCaches;
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
                copyUser.update = Date.now();
                copySay.like.splice(copySay.like.indexOf(foundLiker!), 1);
                copySay.like = [...copySay.like];
                copySay.reply = [...copySay.reply];
                const foundUser = users.find(copyUser.serial);
                if (foundUser) {
                    users.update(copyUser);
                } else {
                    reject(new Error('user not found'));
                }
                const cache = caches.getCaches;
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
    updateUserNotify(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            if (this.currentUser) {
                const copy = Object.assign({}, this.currentUser);
                copy.notify = copy.notify.map(e => {
                    if (e[1] === true) e[1] = false;
                    return e;
                });
                this.currentUser = copy;
                users.update(copy);
                resolve(true);
            } else {
                reject(new Error('login state error!'));
            }
        });
    }

    @action
    setLogged(logged: Boolean) {
        this.logged = logged;
    }

    @action
    login(email: string, password: string): Promise<Boolean> {
        return new Promise((resolve) => {
            const found = users.getUsers.find(e => e.email === email);
            if (found && bcrypt.compareSync(password, found.password)) {
                this.currentUser = {
                    serial: found.serial,
                    name: found.name,
                    email: found.email,
                    password: found.password,
                    icon: found.icon,
                    profile: found.profile || '',
                    follow: found.follow,
                    follower: found.follower,
                    like: found.like,
                    notify: found.notify || [],
                    clientId: clientId,
                    update: Date.now()
                };
                found.clientId = this.currentUser.clientId;
                found.update = this.currentUser.update;
                this.logged = true;
                this.saveSession();
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    @action
    logout(): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.logged = false;
            this.disposeSession();
            if (this.currentUser) {
                const serial = this.currentUser.serial;
                const found = users.getUsers.find(e => e.serial === serial);
                if (found) {
                    found.clientId = 'no id';
                    found.update = Date.now();
                    this.currentUser = null;
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
            const filtered = users.getUsers.filter(e => (e.email === email || e.name === name));
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
                    profile: '',
                    follow: [],
                    follower: [],
                    like: [],
                    notify: [],
                    clientId: clientId,
                    update: Date.now()
                };
                users.add(user);
                resolve(true);
            }
        });
    }

    private saveSession() {
        const copy = Object.assign({}, this.currentUser);
        (Object.keys(copy) as Array<keyof typeof copy>).forEach((key) => {
            if (copy[key] instanceof Array) {
                if (key === 'notify') {
                    (copy[key] as [string, Boolean][]) = [...copy[key].map(ee => {
                        return Object.assign({}, ee);
                    })];
                } else {
                    (copy[key] as Array<any>) = [...(copy[key] as Array<any>)];
                }
            }
        });
        const session = {obj: copy, expire: Date.now() + (7 * 24 * 60 * 60 * 1000)};
        localForage.setItem('user_session', session).catch(err => console.error(err));
        console.log('session saved!');
    }

    private loadSession() {
        localForage.getItem<{obj: UserType, expire: number}>('user_session').then((result) => {
            console.log(result);
            if (result) {
                if (result.expire > Date.now()) {
                    const found = users.find(result.obj.serial);
                    if (found) {
                        this.currentUser = found;
                        this.logged = true;
                        console.log('session loaded!');
                    } else {
                        this.disposeSession();
                    }
                } else {
                    this.disposeSession();
                }
            }
        }).catch(err => console.error(err));
    }

    private disposeSession() {
        localForage.removeItem('user_session').catch(err => console.error(err));
        console.log('session disposed!');
    }

    constructor() {
        console.log('userStore init');
        this.loadSession();
    }

}

export default new UserStore();