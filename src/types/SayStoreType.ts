import SayType from "./SayType";

export default interface SayStoreType {
    getSays: SayType[]
    addSay(say: SayType): void
    updateSay(say: SayType): Promise<Boolean>
    getHear: SayType[]
    setHear(hear: SayType[]): void
    timeLine: Array<SayType>
}