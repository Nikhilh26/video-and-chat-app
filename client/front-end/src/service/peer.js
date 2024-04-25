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
                ],
                iceTransportPolicy: 'all' // or 'relay' depending on your network conditions
            });

            this.dataChannel = this.peer.createDataChannel('text-channel');
        }
    }

    async getAns(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const ansOffer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ansOffer));
            return ansOffer;
        }
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async setAns(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        }
    }
}

export default new PeerService();