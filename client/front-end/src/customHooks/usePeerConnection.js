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

    const handleRemoteUserJoin = ({ email, id }) => {
        setRemoteSocketId(id);
        console.log(email);
    };

    const handleCallUser = async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch((err) => {
            console.log(err);
        });
        setDC(peer.dataChannel);
        setMyStream(stream);

        //console.log("handlecalluser"); //init
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
    };

    const handleIncommingCall = async ({ from, offer }) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });

        peer.peer.addEventListener('datachannel', (e) => {
            console.log('evoked');
            setDC(e.channel);
        })

        areTracksSetForOther = 1;
        setMyStream(stream);
        setRemoteSocketId(from);
        //console.log('handleIncommingCall'); //reciever
        const ansOffer = await peer.getAns(offer);
        socket.emit("call:accepted", { to: from, ansOffer });
    };

    const handleOnAcceptAns = ({ from, ansOffer }) => {
        //console.log('handleOnAcceptAns');
        peer.setAns(ansOffer);
        trackSet();
    };

    const handleNegotiationNeededOffer = async ({ from, offer }) => {
        const ansOffer = await peer.getAns(offer);
        //console.log('handleNegotiationNeededOffer');
        socket.emit('negotiation:final', { to: remoteSocketId, ansOffer });
    };

    const handleNegotiationFinalOffer = async ({ from, ansOffer }) => {
        await peer.setAns(ansOffer);
        console.log('handleNegotiationFinalOffer');
        if (!areTracksSetForOther) {
            areTracksSetForOther = 1;
            socket.emit('start:receiver', { to: remoteSocketId });
        }
    };

    const trackSet = () => {
        console.log('sett');
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    };

    const handleNegotiationNeeded = async () => {
        const offer = await peer.getOffer();
        // condition added to avoid the event emitted by datachannel
        if (remoteSocketId)
            socket.emit("negotiation:needed", { to: remoteSocketId, offer });
    };

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
            socket.off('handleIceCandidateAdd', handleIceCandidateAdd);
        };

    }, [socket, remoteSocketId, myStream]);

    useEffect(() => {
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

    const handleOnIceCandidate = (e) => {
        console.log('recieved');
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