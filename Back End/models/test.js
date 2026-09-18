const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSchema = new Schema({
    maxMuscleUps:{
        type: Number,
        required: true,
    },
        maxDips:{
        type: Number,
        required: true,
    },
        maxPullUps:{
        type: Number,
        required: true,
    },
        maxPushUps:{
        type: Number,
        required: true,
    },
        oneRepMaxMuscleUps:{
        type: Number,
        required: true,
    },
        oneRepMaxDips:{
        type: Number,
        required: true,
    },
        oneRepMaxPullUps:{
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Test', testSchema);