const Chat = require("../Models/Chat");
const User = require("../Models/User")
const mongoose = require("mongoose");

exports.accessChat = async (req, res) => {
    try {
        let { id } = req.user;
        let { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
        const chats = await Chat.find({
            isGroupChat: false, $and: [
                { users: { $elemMatch: { $in: [id] } } },
                { users: { $elemMatch: { $in: [userId] } } }
            ]
        }).populate("users", "fullname username image").populate("latestMessage");

        const isChat = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "fullname email username"
        });

        if (isChat.length > 0) {
            res.status(200).json({
                success: true,
                message: "Chat fetched successfully",
                data: isChat[0]
            })
        }
        else {
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [id, userId],
            };

            try {
                const createdChat = await Chat.create(chatData);
                const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("user", "fullname username image");
                res.status(200).json({
                    success: true,
                    message: "Chat fetched successfully",
                    data: fullChat
                })
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    success: false,
                    message: "Error in crating Chats.",
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in accessing Chats.",
        });
    }

}

exports.fetchChats = async (req, res) => {
    try {
        let chats = await Chat.find({ users: { $elemMatch: { Seq: req.user.id } } })
            .populate("user", "fullname username image")
            .populate("groupAdmin", "fullname username image")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name email",
                });
            });
            console.log(chats);
        res.status(200).json({
            success: true,
            data: chats,
            message: "Chats fetched succesfully"
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            successfalse,
            message: "Error in fetching chats"
        })
    }
}

exports.fetchGroups = async (req, res) => {
    try {

        let chats = await Chat.where("isGroupChat").equals(true);
        res.status(200).json({
            success: true,
            data: chats,
            message: "Group Chats fetched succesfully"
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Error in fetching group chats"
        })
    }

}

exports.createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json({
            success: false,
            message: "Data is insufficient."
        });
    }
    var users = JSON.parse(req.body.users);
    console.log("chatController/createGroups: ", req);
    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate("user", "fullname username image")
            .populate("groupAdmin", "fullname username image");
        res.status(200).json({
            success: true,
            data: fullGroupChat,
            message: "Chats fetched succesfully."
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Error in creating group chats"
        })
    }
}

exports.groupExit = async (req, res) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate({ _id: chatId },
        { $pull: { users: userId } }, { new: true }).populate("user", "fullname username image")
        .populate("groupAdmin", "fullname username image");

    if (!removed) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Chat not found user not removed"
        })
    }
    else {
        res.status(200).json({
            success: true,
            data: removed,
            message: "User removed succesfully."
        });
    }

}

exports.addSelfToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(chatId, {
        $push: { users: userId }
    }, { new: true }
    ).populate("user", "fullname username image")
        .populate("groupAdmin", "fullname username image");

    if (!added) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Chat not found user not added."
        })
    }
    else {
        res.status(200).json({
            success: true,
            data: removed,
            message: "User added succesfully."
        });
    }
}
