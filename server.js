const { Server } = require("socket.io"); // server class
const io = new Server(8000, { cors: true }); // io is an instance of server class also {cors:true} to allow cross origin req

io.on('connection', (socket) => {

    socket.on('room:join', (data) => {
        const { email, room } = data;
        io.to(room).emit('user:joined', { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit('room:join', { email, room });
    })

    socket.on("user:call", ({ to, offer }) => {
        console.log("user:call");
        socket.to(to).emit("incoming:call", { from: socket.id, offer });
    })

    socket.on('call:accepted', ({ to, ansOffer }) => {
        console.log("forwarding");
        //console.log(ansOffer);
        io.to(to).emit("accept:ansoffer", { from: socket.id, ansOffer });
    })

    socket.on('negotiation:needed', ({ to, offer }) => {
        console.log('negotiation:needed');
        io.to(to).emit('negotiation:needed:offer', { from: socket.id, offer });
    })

    socket.on('negotiation:final', ({ to, ansOffer }) => {
        console.log('negotiation:final');
        io.to(to).emit('negotiation:final:offer', { from: socket.id, ansOffer });
    })

    socket.on('start:receiver', ({ to }) => {
        console.log('start:receiver');
        io.to(to).emit('execute:trackSetting');
    })

    socket.on('iceCandidate:recieve', ({ to, iceCandidate }) => {
        console.log('iceCandidate:recieve');
        io.to(to).emit('iceCandidate:send', { from: socket.id, iceCandidate });
    })
})

const express = require("express");
const app = express();

app.listen(3001, (port, err) => {
    console.log("done");
})


// socket.on('offer', ({ offer }) => {
//     console.log('offer');
//     //console.log(offer);
//     socket.emit('recieve:offer', { offer });
// })

// socket.on('send', ({ answer }) => {
//     console.log('send');
//     socket.emit('send:answer', { answer });
// })