import { MyWebSocket } from "../utils";

export default interface PcStoreType {
    getWs(): MyWebSocket | null
    getPc(category: string): RTCPeerConnection | null
    getQueue(category: string): RTCIceCandidate[] | null
    clearQueue(category: string): void
    getPreOffer(): string | null
    clearPreOffer(): void
}