export default interface WsPayloadType {
    id: string
    to: string
    pc?: string
    preOffer?: string
    preAnswer?: string
    offer?: string
    answer?: string
    candidate?: {
        candidate: string
        sdpMLineIndex: number
        sdpMid: string
    }
}