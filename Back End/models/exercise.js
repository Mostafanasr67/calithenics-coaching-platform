const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    day: {
        type: Schema.Types.ObjectId,
        ref: "TrainingDay",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    sets: {
        type: String,
    },
    reps: {
        type: String,
    },
    weight: {
        type: String,
    },
    rest: {
        type: String,
    },
    tempo: {
        type: String,
    },
    rir: {
        type: String,
    },
    notes:{
        type: String,
    }

}, { timestamps: true });

module.exports = mongoose.model("Exercise", exerciseSchema);