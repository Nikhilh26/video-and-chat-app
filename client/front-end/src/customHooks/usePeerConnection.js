import { useState, useEffect } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

let areTracksSetForOther = 0;

const usePeerConnection = () => {
    const [myStream, setMyStream] = useState(null);
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [dataChannel, setDC] = useState(null);

    const socket = useSocket();

    /* This will be executed for whoever joins first
     *  Invoked by Backend
     */
    const handleRemoteUserJoin = ({ email, id }) => {
        setRemoteSocketId(id);
        // console.log(email);
    };

    /* This is shared to the component via the hook and it is called when call button is clicked(Executed at user who joined first
     *  This generates Offer and sends that to the other user
     */
    const handleCallUser = async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch((err) => {
            console.log(err);
        });
        setDC(peer.dataChannel);
        setMyStream(stream);

        const offer = await peer.getOffer();
        // console.log(offer);
        socket.emit("user:call", { to: remoteSocketId, offer });
    };

    /* This will be executed for user who joined second
     * Invoked by backend as event is emitted there  
     * 
     * What this does is it generates an offer and sends this to other user(AKA the person who joined first)
     * Also sets that sets datachannel for that person
     * Also recieves the offer from user who joined first
     */
    const handleIncommingCall = async ({ from, offer }) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        peer.peer.addEventListener('datachannel', (e) => {
            // console.log('evoked');
            // console.log(e);
            setDC(e.channel);
        })

        areTracksSetForOther = 1;
        setMyStream(stream);
        setRemoteSocketId(from);
        const ansOffer = await peer.getAns(offer);
        // console.log(ansOffer)
        socket.emit("call:accepted", { to: from, ansOffer });
    };

    /*  Executed at User who joined first 
     *  What this does is that it recieves offer and sets it as its own Remote description
     *  Trackset adds all of my tracks in my RTCPeer which causes emission of negotiationneeded
     *  Also this leads to creation of SSRC in the RTP channel  
     */
    const handleOnAcceptAns = async ({ from, ansOffer }) => {
        await peer.setAns(ansOffer);
        trackSet();
    };

    /**
     * Executed after handlenegotiationneeded
     */
    const handleNegotiationNeededOffer = async ({ from, offer }) => {
        const ansOffer = await peer.getAns(offer);
        // console.log(ansOffer);
        socket.emit('negotiation:final', { to: remoteSocketId, ansOffer });
    };

    /**
     * Final function executed 
     * areTracksSetForOther -> this is to avoid infinite loop of
     * start:receiver -> execute:trackSetting -> trackSet(method executed at user who joined second) -> handlenegotiationneeded -> handleNegotiationNeededOffer -> FInal 
     */
    const handleNegotiationFinalOffer = async ({ from, ansOffer }) => {
        await peer.setAns(ansOffer);
        // console.log('handleNegotiationFinalOffer');
        if (!areTracksSetForOther) {
            areTracksSetForOther = 1;
            socket.emit('start:receiver', { to: remoteSocketId });
        }
    };

    /**
     * Addition of Tracks in my Webrtc object
     */
    const trackSet = () => {
        console.log(myStream);
        for (const track of myStream.getTracks()) {
            console.log(track);
            peer.peer.addTrack(track, myStream);
        }
    };

    /**
     * 
     */
    const handleNegotiationNeeded = async () => {
        const offer = await peer.getOffer();
        console.log(offer);
        // this was done to avoid sharing of SD when first SD was created 
        if (remoteSocketId)
            socket.emit("negotiation:needed", { to: remoteSocketId, offer });
    };

    /**
     * This adds Ice candidate from other user to current user and vice-versa
     */
    const handleIceCandidateAdd = ({ from, iceCandidate }) => {
        peer.peer.addIceCandidate(new RTCIceCandidate(iceCandidate)).catch((err) => console.log(err));
    }

    useEffect(() => {

        socket.on('remoteUser:joined', handleRemoteUserJoin);
        socket.on("incoming:call", handleIncommingCall);
        socket.on("accept:ansoffer", handleOnAcceptAns);
        socket.on('negotiation:needed:offer', handleNegotiationNeededOffer);
        socket.on('negotiation:final:offer', handleNegotiationFinalOffer);
        socket.on('execute:trackSetting', trackSet);
        socket.on('iceCandidate:send', handleIceCandidateAdd);

        return () => {
            socket.off('remoteUser:joined', handleRemoteUserJoin);
            socket.off("incoming:call", handleIncommingCall);
            socket.off("accept:ansoffer", handleOnAcceptAns);
            socket.off('negotiation:needed:offer', handleNegotiationNeededOffer);
            socket.off('negotiation:final:offer', handleNegotiationFinalOffer);
            socket.off('execute:trackSetting', trackSet);
            socket.off('iceCandidate:send', handleIceCandidateAdd);
        };

    }, [socket, remoteSocketId, myStream]);

    useEffect(() => {
        // emmited after addition of tracks
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
        peer.peer.addEventListener('track', (event) => {
            const remoteStream1 = event.streams;
            setRemoteStream(remoteStream1[0]);
        });

        return () => {
            peer.peer.removeEventListener('track', (event) => {
                const remoteStream1 = event.streams;
                setRemoteStream(remoteStream1);
            });
            peer.peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
        };
    });

    /*
     * This is executed at both users as ice candidates can be emitted by any of them ,
     * these are sent to signalling which redirects these to other user and executes handleIceCandidateAdd 
     * 
    */
    const handleOnIceCandidate = (e) => {
        if (e.candidate) {
            socket.emit('iceCandidate:recieve', { to: remoteSocketId, iceCandidate: e.candiddate });
        }
    }

    useEffect(() => {
        peer.peer.addEventListener('icecandidate', handleOnIceCandidate);
        return () => {
            peer.peer.removeEventListener('icecandidate', handleOnIceCandidate);
        }
    }, []);

    return {
        myStream,
        remoteSocketId,
        remoteStream,
        dataChannel,
        handleCallUser
    }
}

export default usePeerConnection;