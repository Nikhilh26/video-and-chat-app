import peer from "./peer";

class peerHandler {
    // This is called when when we click Call button 
    // Try to make it happen without clicking call button
    handleCallUser = async (handleUpdateDatachanelAndMyStream, remoteSocketId, socket) => {

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            handleUpdateDatachanelAndMyStream(stream);
            const offer = await peer.getOffer();
            socket.emit("user:call", { to: remoteSocketId, offer });


        } catch (error) {
            console.log(error);

        }

        // setDC(peer.dataChannel);
        // setMyStream(stream);
    };
}

export default new peerHandler();