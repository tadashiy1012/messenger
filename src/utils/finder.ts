import { SayType, UserType } from '../types';
import { noImage } from '../utils/noImageIcon';
import users from '../stores/users';
import caches from '../stores/caches';

export default class Finder {

    private constructor() {}

    public static findAuthorIcon(authorId: string): string {
        const found = users.getUsers.find(e => e.serial === authorId);
        if (found && found.icon) {
            return found.icon === '' ? noImage : found.icon;
        } else {
            return noImage;
        }
    }

    public static findAuthorName(authorId: string): string {
        const found = users.getUsers.find(e => e.serial === authorId);
        if (found && found.name) {
            return found.name
        } else {
            return 'no_name';
        }
    }

    public static findUser(userSerial: string): UserType | null {
        const found = users.getUsers.find(e => e.serial === userSerial);
        return found || null
    }

    public static findUserAsync(userSerial: string): Promise<UserType | null> {
        return new Promise((resolve) => {
            if (users.getUsers.length > 0) {
                const found = users.getUsers.find(e => e.serial === userSerial);
                resolve(found);
            } else {
                let count = 0;
                const timer = setInterval(() => {
                    if (count >= 3) {
                        console.log('findUserAsync time out');
                        clearInterval(timer);
                        resolve(null);
                    }
                    if (users.getUsers.length > 0) {
                        const found = users.getUsers.find(e => e.serial === userSerial);
                        clearInterval(timer);
                        resolve(found);
                    }
                    count += 1;
                }, 1000)
            }
        });
    }

    public static findUserByName(userName: string): UserType | undefined {
        return users.getUsers.find(e => e.name === userName);
    }

    public static findUserSay(userSerial: string): Promise<Array<SayType>> {
        return new Promise((resolve) => {
            const cache = caches.getCaches;
            const found = cache.find(e => e.says[0].authorId === userSerial);
            if (found) {
                resolve(found.says);
            } else {
                resolve([]);
            }
        });
    }

    public static findUserSaySync(userSerial: string): SayType[] {
        const says: Array<SayType> = caches.getCaches.reduce<SayType[]>((acc, e) => {
            acc.push(...e.says);
            return acc;
         }, []);
         return says.filter(e => e.authorId === userSerial);
    }

    public static findSay(sayId: string): SayType | undefined {
        const says: Array<SayType> = caches.getCaches.reduce<SayType[]>((acc, e) => {
           acc.push(...e.says);
           return acc;
        }, []);
        return says.find(e => e.id === sayId);
    }

    public static searchSay(keyword: string): SayType[] {
        const says: Array<SayType> = caches.getCaches.reduce<SayType[]>((acc, e) => {
            acc.push(...e.says);
            return acc;
        }, []);
        return says.filter(e => e.say.indexOf(keyword) > -1).sort((a, b) => {
            return b.date - a.date;
        });
    }

    public static searchReply(userSerial: string): SayType[] {
        const says: Array<SayType> = caches.getCaches.reduce<SayType[]>((acc, e) => {
            acc.push(...e.says);
            return acc;
        }, []);
        const ids = says.filter(e => e.authorId === userSerial).map(e => e.id);
        return says.filter(e => {
            return e.reply.find(ee => {
                return ids.find(eee => eee === ee) !== undefined;
            }) !== undefined;
        });
    }

    public static searchUser(keyword: string): UserType[] {
        return users.getUsers.filter(e => {
            if (e.name.indexOf(keyword) > -1 
                || (e.email && e.email.indexOf(keyword) > -1) 
                || (e.profile && e.profile.indexOf(keyword) > -1)) {
                return true;
            } else {
                return false;
            }
        });
    }

}