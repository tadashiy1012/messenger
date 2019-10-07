export default function getJsonCopy<T>(target: T): T {
    return JSON.parse(JSON.stringify(target));
}