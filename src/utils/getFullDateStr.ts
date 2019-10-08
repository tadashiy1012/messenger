export default function getFullDateStr(time: number): string {
    const dt = new Date(time);
    const Y = dt.getFullYear().toString();
    const M = (dt.getMonth() + 1).toString();
    const d = dt.getDate().toString();
    const h = dt.getHours().toString();
    const m = dt.getMinutes().toString();
    return Y + '-' + (M.length === 1 ? ('0' + M) : M) + '-' + (d.length === 1 ? ('0' + d) : d) + 
        ' ' + (h.length === 1 ? ('0' + h) : h) + ':' + (m.length === 1 ? ('0' + m) : m);
}