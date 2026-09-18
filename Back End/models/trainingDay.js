const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trainingDaySchema = new Schema(
	{
		plan: {
			type: Schema.Types.ObjectId,
			ref: "Plan",
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		number: {
			type: Number,
			required: true,
		},
        notes: {
            type: String,
        },
		exercises: [
			{
				type: Schema.Types.ObjectId,
				ref: "Exercise",
			},
		],	
	},
	{ timestamps: true },
);

module.exports = mongoose.model("TrainingDay", trainingDaySchema);
