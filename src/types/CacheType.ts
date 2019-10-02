import SayType from "./SayType";

export default interface CacheType {
    id: string
    timestamp: number
    says: Array<SayType>
}