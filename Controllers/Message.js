const Chat = require("../Models/Chat");
const User = require("../Models/User")
const Message = require("../Models/Message")
const mongoose = require("mongoose");



exports.allMessages = async (req, res) => {

    try {
        const { chatId } = req.query;
        console.log(chatId);
        const messages = await Message.find({ chat: chatId }).populate("sender", "fullname username image email").populate("receiver", "fullname image username email").populate("chat")
        res.status(200).json({
            success: true,
            data: messages,
            message: "Messages fetched succesfully."
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Messages not found."
        })

    }
}


exports.sendMessage = async (req, res) => {
    try {
        let { id } = req.user;
        const { chatId, content } = req.body;
        if (!content || !chatId) {
            return res.status(400).json({
                success: false,
                message: "Data is insufficient."
            });
        }
        var newMessage = {
            sender: id,
            content,
            chat: chatId
        }

        try {
            var messages = await Message.create(newMessage);
            messages = await messages.populate("sender", "fullname image email username")
            messages = await messages.populate("chat")
            messages = await messages.populate("receiver", "fullname image email username")
            messages = await User.populate(messages, { path: "chat.users", select: "fullname image email usename" })

            const chatData = await Chat.findByIdAndUpdate(chatId, { latestMessage: messages })
            res.status(200).json({
                success: true,
                data: chatData,
                message: "Messages sent succesfully."
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                success: false,
                message: "Chat not found."
            })
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "Messages not sent."
        })

    }
}
