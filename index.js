const express = require("express");
const userRoutes = require("./Routes/User")
const postRoutes = require("./Routes/Post")
const authRoutes = require("./Routes/Auth")
const chatRoutes = require("./Routes/Chat")
const messageRoutes = require("./Routes/Message")
const cors = require("cors")
const database = require('./Configue/database');
const dotenv = require('dotenv');
const { app, server, io } = require("./Socket/Socket");


dotenv.config();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Server is up and running..."
    });
});

server.listen(PORT, () => {
    database.connect();
    console.log(`Server Started At Port No.= ${PORT}`);
})

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/message", messageRoutes);


