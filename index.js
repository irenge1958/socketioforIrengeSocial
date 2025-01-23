const io = require("socket.io")(5000, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

let users = [];
console.log(users)
const adduser = (user, socketId) => {
    if (!users.some(x => x.user._id === user._id)) {
        users.push({ user: user, socketId: socketId });
    }
   
    console.log("User added:", users);
};

const removeUser = (socketId) => {
    users = users.filter(x => x.socketId !== socketId);
    console.log("User removed. Updated users list:", users);
};

const getreciever = (id) => {
    const receiver = users.find(z => z.user._id === id);
    console.log("Receiver found:", receiver);
    return receiver;
};

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);

    socket.on('myuser', user => {
        adduser(user, socket.id);
        io.emit('mymess', users);
    });
 socket.on('newconversation',(convid,recieverd)=>{
    const receiver = getreciever(recieverd);
    if (receiver) {
        io.to(receiver.socketId).emit('laconv',convid);
    }
 })
    // send message
    socket.on('getmessage', ({ senderid, text, recieverdid,maconv }) => {
        console.log("Message received from:", senderid, "to:", recieverdid, "text:", text);
        const receiver = getreciever(recieverdid);
        if (receiver) {
            console.log("Sending message to receiver:", receiver.socketId);
            io.to(receiver.socketId).emit('theinstantmess', {
                senderid,
                text,
                maconv
            });
        } else {
            console.log("Receiver not found.");
        }
    });

    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`);
        removeUser(socket.id);
        io.emit('mymess', users); // emit the updated users list
    });
});
