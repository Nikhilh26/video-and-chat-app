const { Server } = require("socket.io"); // server class
const io = new Server(8000, { cors: true }); // io is an instance of server class also {cors:true} to allow cross origin req

io.on('connection', (socket) => {
    console.log('COnnection succesful');
    // This event emmited by handleOnSubmit in Lobby (Executed when a user submits the form)
    socket.on('room:join', ({ email, room }) => {
        // This emits events to those who already exists in the room 
        io.to(room).emit('remoteUser:joined', { email, id: socket.id });
        // Adding the user with email in the room number room
        socket.join(room);
        // This event is redirecting to /room/:id
        console.log(email);
        io.to(socket.id).emit('room:join:redirect', { email, room });
    })

    socket.on("user:call", ({ to, offer }) => {
        // console.log("user:call");
        socket.to(to).emit("incoming:call", { from: socket.id, offer });
    })

    socket.on('call:accepted', ({ to, ansOffer }) => {
        // console.log("forwarding");
        io.to(to).emit("accept:ansoffer", { from: socket.id, ansOffer });
    })

    socket.on('negotiation:needed', ({ to, offer }) => {
        // console.log('negotiation:needed');
        io.to(to).emit('negotiation:needed:offer', { from: socket.id, offer });
    })

    socket.on('negotiation:final', ({ to, ansOffer }) => {
        // console.log('negotiation:final');
        io.to(to).emit('negotiation:final:offer', { from: socket.id, ansOffer });
    })

    socket.on('start:receiver', ({ to }) => {
        // console.log('start:receiver');
        io.to(to).emit('execute:trackSetting');
    })

    socket.on('iceCandidate:recieve', ({ to, iceCandidate }) => {
        console.log('iceCandidate:recieve');
        io.to(to).emit('iceCandidate:send', { from: socket.id, iceCandidate });
    })
})