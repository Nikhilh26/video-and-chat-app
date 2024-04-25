import React, { createContext, useMemo, useContext, useState } from 'react';
import io from 'socket.io-client';
const SocketContext = createContext();
// const EmailStateContext = createContext();

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

// export const useEmail = () => {
//     return useContext(EmailStateContext);
// }

export default function SocketProvider(props) {
    const socket = useMemo(() => {

        try {
            return io('http://localhost:8000')
        } catch (error) {
            console.log(error);
            return null;
        }
    }, []);

    console.log(socket)
    //if (socket.connected === false) return (<div>Server Down Try again After Some time</div>)

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}

// <EmailStateContext.Provider value={{ email, SetEmail }}>
// </EmailStateContext.Provider>