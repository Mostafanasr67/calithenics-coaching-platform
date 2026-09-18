const mongoose = require("mongoose");

const workoutExerciseSchema = new mongoose.Schema(
	{
		exercise: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exercise",
			required: true,
		},

		completed: {
			type: Boolean,
			default: false,
		},

		progress: [
			{
				sets: {
					type: Number,
				},
				reps: {
					type: Number,
				},

				weight: {
					type: Number,
				},
			},
		],

		notes: {
			type: String,
			default: "",
		},
	},
	{ _id: false },
);

const workoutSessionSchema = new mongoose.Schema(
	{
		client: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		plan: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Plan",
			required: true,
		},

		trainingDay: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "TrainingDay",
			required: true,
		},

		weekNumber: {
			type: Number,
			required: true,
			default: 1,
		},

		status: {
			type: String,
			enum: ["Not Started", "In Progress", "Completed", "Skipped"],
			default: "Not Started",
		},

		scheduledDate: {
			type: Date,
		},

		startedAt: {
			type: Date,
		},

		completedAt: {
			type: Date,
		},

		duration: {
			type: Number, // minutes
		},

		exercises: [workoutExerciseSchema],

		notes: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
