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

    public static findSay(sayId: string): SayType | undefined {
        const says: Array<SayType> = caches.getCaches.reduce<SayType[]>((acc, e) => {
           acc.push(...e.says);
           return acc;
        }, []);
        return says.find(e => e.id === sayId);
    }

}