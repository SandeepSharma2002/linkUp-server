const { Server } = require("socket.io");
const express = require("express");

const app = express();

let server = require('http').createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST", "PUT"],
        credentials: true
    }
});

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};


const userSocketMap = {};

io.on('connection', (socket) => {
    console.log("User Connected Id :" + socket.id);

    const userId = socket.handshake.query.userId;
    if (userId != "undefined") userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // socket.on() is used to listen to the events. can be used both on client and server side
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})

module.exports = { app, io, server, getReceiverSocketId }