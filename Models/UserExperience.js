const mongoose = require("mongoose");

const userExperienceSchema = new Schema({
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    }
});

module.exports = mongoose.model("experiences", userExperienceSchema);