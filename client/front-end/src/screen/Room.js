import ReactPlayer from 'react-player';
import '../index.css';
import usePeerConnection from '../customHooks/usePeerConnection';

export default function Room() {

    const {
        myStream,
        remoteSocketId,
        remoteStream,
        dataChannel,
        handleCallUser
    } = usePeerConnection();

    return (

        <div className='flexbox-row'>

            <div style={{ 'textAlign': 'center' }}>
                <h1>Room</h1>
                <h4>{remoteSocketId ? 'Connected' : 'No one in room'}</h4>

                <div>
                    {
                        remoteSocketId
                        &&
                        <button onClick={handleCallUser}>Call</button>
                    }
                </div>

                <div>
                    {
                        myStream
                        &&
                        <div>
                            <h4>You</h4>
                            <ReactPlayer
                                url={myStream}
                                height='90vh'
                                width='90vw'
                                playing
                            />

                        </div>
                    }

                </div>

                {
                    remoteStream
                    &&
                    <div>
                        <h4>Other:</h4>
                        <ReactPlayer url={remoteStream}
                            height='100px' width='100px' playing />
                    </div>
                }

            </div>
        </div>
    )
}

/*
{
                dataChannel &&
                <div>
                    <Chat dataChannel={dataChannel} />
                </div>
            }
*/

// To Do
// Change in Architecture so that i can join with the link

// const handleUpdateDatachanelAndMyStream = (myStream) => {
//     setDC(peer.dataChannel);
//     setMyStream(myStream);
// }