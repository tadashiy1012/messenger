import caches from '../stores/caches';
import users from '../stores/users';

export default function exportData() {
    const data = {
        caches: caches.getCaches,
        users: users.getUsers
    };
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'data.json';
    a.href = objUrl;
    a.click();
    URL.revokeObjectURL(objUrl);
}
