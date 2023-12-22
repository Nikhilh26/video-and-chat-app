class PeerService {

    constructor() {

        if (!this.peer) {

            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478"
                        ]
                    }
                ]
            })

        }

    }

    async getAns(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer);
            const ansOffer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ansOffer));
            return ansOffer;
        }
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            // await this.peer.setLocalDescription(offer); -> both are equivalent
            return offer; // why return offer ??
        }
    }

    async setAns(offer) {
        if (this.peer) {
            console.log(offer);
            await this.peer.setRemoteDescription(offer);
        }
    }
}

export default new PeerService();