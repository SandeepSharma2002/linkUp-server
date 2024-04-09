const mongoose = require("mongoose");

const postSchema = mongoose.Schema({

    post_Id: {
        type: String,
        required: true,
        ref: 'posts',
        unique: true,
    },
    postImages: {
        type: [String],
        // required: true,
    },
    des: {
        type: String,
        maxlength: 1000,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    activity: {
        total_likes: {
            type: Number,
            default: 0
        },
        total_comments: {
            type: Number,
            default: 0
        },
        total_parent_comments: {
            type: Number,
            default: 0
        },
    },
    comments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'comments'
    },
    draft: {
        type: Boolean,
        default: false
    }
}, 
{ 
    timestamps: {
        createdAt: 'publishedAt'
    } 

})

module.exports = mongoose.model("posts", postSchema);