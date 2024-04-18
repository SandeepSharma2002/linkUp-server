const express = require("express");
const { accessChat, fetchChats} = require("../Controllers/Chat");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.post("/accessChat", auth, accessChat);
router.get("/fetchChats", auth, fetchChats);

module.exports = router;