const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const commentSchema = mongoose.Schema({
    
    post_Id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'posts'
    },
    post_author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'posts',
    },
    comment: {
        type: String,
        required: true
    },
    children: {
        type: [Schema.Types.ObjectId],
        ref: 'comments'
    },
    commented_by: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'users'
    },
    isReply: {
        type: Boolean,
        require:true,
        default:false
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }
},
{
    timestamps: {
        createdAt: 'commentedAt'
    }
})

module.exports = mongoose.model("comments", commentSchema)