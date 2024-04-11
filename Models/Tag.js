const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tagSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    totalSearch: {
        type: Number,
        default: 0
    },
    totalPosts: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model("tag",tagSchema)