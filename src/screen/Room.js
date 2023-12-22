import React, { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player'
import peer from '../service/peer';

let areTracksSetForOther = 0;

export default function Room() {
    const [myStream, setMyStream] = useState(null);
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const socket = useSocket();

    const handleUserJoin = ({ email, id }) => {
        setRemoteSocketId(id);
        console.log("handleuserjoin"); // init
    }

    const handleCallUser = async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch((err) => { console.log(err) });

        setMyStream(stream);

        console.log("handlecalluser"); //init
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        console.log(myStream);
    };

    const handleIncommingCall = async ({ from, offer }) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        areTracksSetForOther = 1;
        setMyStream(stream);
        setRemoteSocketId(from);
        console.log('handleIncommingCall'); //reciever
        const ansOffer = await peer.getAns(offer);
        socket.emit("call:accepted", { to: from, ansOffer });
    }

    const handleOnAcceptAns = ({ from, ansOffer }) => {
        console.log(peer.peer);
        peer.setAns(ansOffer);
        console.log(peer.peer);
        console.log('Call Accepted!!!'); //init

        trackSet();
    };

    const handleNegotiationNeededOffer = async ({ from, offer }) => {
        const ansOffer = await peer.getAns(offer);
        console.log(ansOffer);
        socket.emit('negotiation:final', { to: remoteSocketId, ansOffer });
    }

    const handleNegotiationFinalOffer = async ({ from, ansOffer }) => {
        await peer.setAns(ansOffer);
        console.log('final complete');
        if (!areTracksSetForOther) {
            areTracksSetForOther = 1;
            socket.emit('start:receiver', { to: remoteSocketId });
        }
    }

    const trackSet = () => {
        for (const track of myStream.getTracks()) {
            console.log(track);
            peer.peer.addTrack(track, myStream);
        }
    }

    useEffect(() => {

        socket.on('user:joined', handleUserJoin);
        socket.on("incoming:call", handleIncommingCall);
        socket.on("accept:ansoffer", handleOnAcceptAns);
        socket.on('negotiation:needed:offer', handleNegotiationNeededOffer);
        socket.on('negotiation:final:offer', handleNegotiationFinalOffer);
        socket.on('execute:trackSetting', trackSet);

        return () => {
            socket.off('user:joined', handleUserJoin);
            socket.off("incoming:call", handleIncommingCall);
            socket.off("accept:ansoffer", handleOnAcceptAns);
            socket.off('negotiation:needed:offer', handleNegotiationNeededOffer);
            socket.off('negotiation:final:offer', handleNegotiationFinalOffer);
            socket.off('execute:trackSetting', trackSet);
        }

    }, [socket, remoteSocketId, myStream]);

    const handleNegotiationNeeded = async () => {
        const offer = await peer.getOffer();
        console.log('handleNegotiationNeeded');
        console.log(socket.id);
        socket.emit("negotiation:needed", { to: remoteSocketId, offer });
    }

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
        peer.peer.addEventListener('track', (event) => {
            console.log('Track event received:');
            const remoteStream1 = event.streams;
            console.log(remoteStream1);
            setRemoteStream(remoteStream1[0]);
        });

        return () => {
            peer.peer.removeEventListener('track', (event) => {
                console.log('Track event received:');
                const remoteStream1 = event.streams;
                setRemoteStream(remoteStream1);
            })
            peer.peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
        }
    })

    return (
        <div>
            <h1>Room</h1>
            <h4>{remoteSocketId ? 'Connected' : 'No one in room'}</h4>
            {
                remoteSocketId
                &&
                <button onClick={handleCallUser}>Call</button>
            }
            {
                myStream
                &&
                <div>
                    <h4>You</h4>
                    <ReactPlayer url={myStream} volume={1} height='100px' width='100px' playing />
                </div>
            }
            {
                remoteStream
                &&
                <div>
                    <h4>Other:</h4>
                    <ReactPlayer url={remoteStream} volume={1} height='100px' width='100px' playing />
                </div>
            }

        </div>
    )
}