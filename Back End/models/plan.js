const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
	client: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	mainGoal: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},

	status: {
		type: String,
        enum: ["Active", "Inactive"],
        default: "Active",
		required: true,
	},

	startDate: {
		type: Date,
		required: true,
	},

	endDate: {
		type: Date,
		required: true,
	},

	coachNotes: {
		type: String,
	},
    trainingDays: [{
        type: Schema.Types.ObjectId,
        ref: "TrainingDay",
    }],
	workoutSessions: [{
		type: Schema.Types.ObjectId,
		ref: "WorkoutSession",
	}],
	weekFeedback: [{
		weekNumber: {
			type: Number,
			required: true,
		},
		feedback: {
			type: String,
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	}],
	numberofWeeks: {
		type: Number,
		required: true,
		default: 4,
	}
	


    
}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);
