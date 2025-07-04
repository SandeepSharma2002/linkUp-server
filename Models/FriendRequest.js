const mongoose = require('mongoose');

const friendsSchema = mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    status: {
        type: Number,
        enums: [
            0,    //'add friend',
            1,    //'requested',
            2,    //'pending',
            3,    //'friends'
        ]
    }
}, { timestamps: true })

module.exports = mongoose.model('Friend', friendsSchema)