const express = require("express");
const { accessChat, fetchChats, fetchGroups, groupExit, createGroupChat, addSelfToGroup } = require("../Controllers/Chat");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.post("/accessChat", auth, accessChat);
router.get("/fetchChats", auth, fetchChats);
router.get("/fetchGroups", auth, fetchGroups);
router.put("/groupExit", auth, groupExit);
router.put("/addSelfToGroup", auth, addSelfToGroup);
router.post("/createGroupChat", auth, createGroupChat);


module.exports = router;