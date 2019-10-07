export default function getFullDateStr(time: number): string {
    const dt = new Date(time);
    const h = dt.getHours().toString();
    const m = dt.getMinutes().toString();
    return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + 
        ' ' + (h.length === 1 ? ('0' + h) : h) + ':' + (m.length === 1 ? ('0' + m) : m);
}