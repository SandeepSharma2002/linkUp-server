const express = require("express");
const app = express();
const userRoutes = require("./Routes/User")
const postRoutes = require("./Routes/Post")
const authRoutes = require("./Routes/Auth")
const cors = require("cors")
const database = require('./Configue/database');
const dotenv = require('dotenv');


dotenv.config();
const PORT = process.env.PORT || 4000;

database.connect()
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Server is up and running..."
    });
});

app.listen(PORT, ()=>{
    console.log(`Server Started At Port No.= ${PORT}`);
})

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
