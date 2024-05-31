class PeerService {
    /**
     * This constructor initializes dataChannel and RTCPeerConnection
     */
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
            });

            this.dataChannel = this.peer.createDataChannel('text-channel');
        }
    }
    // iceTransportPolicy: 'all'
    /*
     *  This takes offer from other user sets that offer as its own offer creates a new offer
     */
    async getAns(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
            const ansOffer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ansOffer));
            return ansOffer;
        }
    }
    /*
     * This just generates an offer 
     */
    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    /*
     * This takes the offer created by getAns of another user
     */
    async setAns(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
        }
    }
}

export default new PeerService();