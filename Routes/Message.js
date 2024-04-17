const express = require("express");
const { auth } = require("../middlewares/auth");
const { allMessages, sendMessage } = require("../Controllers/Message");
const router = express.Router();

router.get("/allmessages", auth, allMessages);
router.post("/sendmessage", auth, sendMessage);


module.exports = router;