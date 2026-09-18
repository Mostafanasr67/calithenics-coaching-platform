const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
    role: {
        type: String,
        enum: ["client", "coach"],
        default: "client",
    },
	name: {
		type: String,
		required: true,
	},
	age: {
		type: Number
	},
	weight: {
		type: Number,
	},
	height: {
		type: Number,
	},
	previousInjuries: {
		type: String,
	},
	primaryGoal: {
		type: String,
	},
	secondaryGoal: {
		type: String,
	},
	startDate: {
		type: Date,
	},
	duration: {
		type: Number,
	},
	workoutFrequency: {
		type: Number,
	},
	workoutLength: {
		type: Number,
	},
	status: {
		type: String,
		default: "Active",
	},
	test: {
		type: Schema.Types.ObjectId,
		ref: "Test",
	},
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
