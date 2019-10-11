import caches from '../stores/caches';
import users from '../stores/users';
import { CacheType, UserType } from '../types';

interface ImportDataType {
    caches: CacheType[]
    users: UserType[]
}

export default function importData(buf: ArrayBuffer) {
    const decoder = new TextDecoder("utf-8");
    const str = decoder.decode(buf);
    const json: ImportDataType = JSON.parse(str);
    caches.replaceAll(json.caches);
    users.replaceAll(json.users);
}