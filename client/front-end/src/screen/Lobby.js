import React, { useEffect, useState, useCallback } from 'react'
import { useSocket } from '../context/SocketProvider';
import { useNavigate } from 'react-router-dom';

export default function Lobby() {

    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');
    const socket = useSocket();
    const navigate = useNavigate();
    console.log(socket);
    function handleOnSubmit(e) {
        e.preventDefault();
        socket.emit('room:join', { email, room });
    }

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        console.log(email, socket.id);
        navigate(`/room/${room}`);
    });

    useEffect(() => {
        socket.on('room:join:redirect', handleJoinRoom);

        return (() => {
            socket.off('room:join:redirect', handleJoinRoom);
        })
    }, []);

    return (
        <div>
            <h1>Lobby</h1>

            <form onSubmit={handleOnSubmit}>
                <label htmlFor='email'>Email ID</label>

                <input
                    id='email'
                    type='text'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <br />

                <label htmlFor='room_no'>Room Number</label>

                <input
                    id='room_no'
                    type='text'
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
                <br />

                <button >Join</button>

            </form>

            <button onClick={() => { handleJoinRoom() }}>click</button>
        </div>
    )
}