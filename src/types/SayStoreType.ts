import SayType from "./SayType";

export default interface SayStoreType {
    getSay: SayType[]
    addSay(say: SayType): Promise<Boolean>
    getHear: SayType[]
    timeLine: Array<SayType>
}