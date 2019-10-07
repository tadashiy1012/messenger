export default function compareJson<T>(A: T, B: T): Boolean {
    return JSON.stringify(A) === JSON.stringify(B);
}