function makePC(): RTCPeerConnection {
    return new RTCPeerConnection({iceServers:
        [{urls: 'stun:stun.services.mozilla.com:3478'}]
    });
}

class PCBuilder {
    pc: RTCPeerConnection | null = null;
    private constructor() {
        this.pc = makePC();
    }
    static builder(): PCBuilder {
        return new PCBuilder();
    }
    setOnIceConnectionstateChange(handler: (ev: any) => void): PCBuilder {
        if (this.pc !== null) {
            this.pc.addEventListener('iceconnectionstatechange', handler);
        }
        return this;
    }
    setOnNegotiationNeeded(handler: (ev: any) => void): PCBuilder {
        if (this.pc !== null) {
            this.pc.onnegotiationneeded = handler;
        }
        return this;
    }
    setOnIceGatheringStateChange(handler: (ev: any) => void): PCBuilder {
        if (this.pc !== null) {
            this.pc.onicegatheringstatechange = handler;
        }
        return this;
    }
    setOnIcecandidate(handler: (ev: RTCPeerConnectionIceEvent) => void): PCBuilder {
        if (this.pc !== null) {
            this.pc.onicecandidate = handler;
        }
        return this;
    }
    setOnTrack(handler: (ev: any) => void): PCBuilder {
        if (this.pc !== null) {
            this.pc.ontrack = handler;
        }
        return this;
    }
    setOnDataChannel(handler: (ev: RTCDataChannelEvent) => void): PCBuilder {
        if (this.pc !== null) {
            this.pc.ondatachannel = handler;
        }
        return this;
    }
    build(): RTCPeerConnection | null {
        return this.pc;
    }
}

export {
    makePC,
    PCBuilder
}