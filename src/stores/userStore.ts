import { observable, computed, action } from 'mobx';
import * as uuid from 'uuid';
import * as bcrypt from 'bcryptjs';
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

    private userNormalize(user: UserType): UserType {
        user.follow = [...user.follow];
        user.follower = [...user.follower];
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
                this.userNormalize(user);
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
                this.userNormalize(userA);
                userA.update = Date.now();
                this.currentUser = userA;
                const found = users.find(this.currentUser);
                if (found) {
                    users.update(userA);
                } else {
                    reject(new Error('user not found'));
                }
                const found2 = users.getUsers.find(e => e.serial === tgtSerial);
                if (found2) {
                    const userB = Object.assign({}, found2);
                    userB.follower = [...userB.follower, userA.serial];
                    this.userNormalize(userB);
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
                this.userNormalize(userA);
                userA.update = Date.now();
                this.currentUser = userA;
                const found = users.find(this.currentUser);
                if (found) {
                    users.update(userA);
                } else {
                    reject(new Error('user not found'));
                }
                const found2 = users.getUsers.find(e => e.serial === tgtSerial);
                if (found2) {
                    const userB = Object.assign({}, found2);
                    userB.follower = [...userB.follower.filter(e => e !== userA.serial)];
                    this.userNormalize(userB);
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
                const foundUser = users.find(copyUser);
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
                this.userNormalize(copyUser);
                copyUser.update = Date.now();
                copySay.like.splice(copySay.like.indexOf(foundLiker!), 1);
                copySay.like = [...copySay.like];
                copySay.reply = [...copySay.reply];
                const foundUser = users.find(copyUser);
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
                    clientId: clientId,
                    update: Date.now()
                };
                found.clientId = this.currentUser.clientId;
                found.update = this.currentUser.update;
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
                const found = users.getUsers.find(e => e.serial === serial);
                if (found) {
                    found.clientId = 'no id';
                    found.update = Date.now();
                    this.currentUser = null;
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
            const filtered = users.getUsers.filter(e => e.email === email);
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
                    clientId: clientId,
                    update: Date.now()
                };
                users.add(user);
                resolve(true);
            }
        });
    }

}

export default new UserStore();