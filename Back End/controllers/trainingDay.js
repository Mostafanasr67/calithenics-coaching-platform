const TrainingDay = require("../models/trainingDay");
const Plan = require("../models/plan");

exports.createTrainingDay = (req, res, next) => {
	try {
		const { plan, title, number, notes } = req.body;

		// Validate required fields
		if (!plan || !title || number === undefined) {
			const error = new Error("Missing required fields for training day creation.");
			error.statusCode = 400;
			throw error;
		}

		// Create new training day
		const trainingDay = new TrainingDay({
			plan,
			title,
			number,
			notes: notes || "",
			exercises: [],
		});

		trainingDay
			.save()
			.then((savedDay) => {
				// Add the new day to the plan's trainingDays array
				return Plan.findByIdAndUpdate(
					plan,
					{ $push: { trainingDays: savedDay._id } },
					{ new: true }
				).then((updatedPlan) => {
					res.status(201).json({
						message: "Training day created successfully",
						trainingDay: savedDay,
						plan: updatedPlan,
					});
				});
			})
			.catch((err) => {
				console.error("Error saving training day:", err);
				const error = new Error("Failed to save training day.");
				error.statusCode = 500;
				throw error;
			});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updateTrainingDay = (req, res, next) => {
	try {
		const dayId = req.params.dayId;
		const updateData = req.body;

		TrainingDay.findByIdAndUpdate(dayId, { $set: updateData }, { new: true })
			.then((updatedDay) => {
				if (!updatedDay) {
					const error = new Error("Training day not found.");
					error.statusCode = 404;
					throw error;
				}
				res.status(200).json({
					message: "Training day updated successfully",
					trainingDay: updatedDay,
				});
			})
			.catch((err) => {
				console.error("Error updating training day:", err);
				const error = new Error("Failed to update training day.");
				error.statusCode = 500;
				throw error;
			});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deleteTrainingDay = (req, res, next) => {
	try {
		const dayId = req.params.dayId;

		TrainingDay.findByIdAndDelete(dayId)
			.then((deletedDay) => {
				if (!deletedDay) {
					const error = new Error("Training day not found.");
					error.statusCode = 404;
					throw error;
				}

				// Remove the day from the associated plan's trainingDays array
				return Plan.findByIdAndUpdate(
					deletedDay.plan,
					{ $pull: { trainingDays: dayId } },
					{ new: true }
				);
			})
			.then((updatedPlan) => {
				res.status(200).json({
					message: "Training day deleted successfully",
					plan: updatedPlan,
				});
			})
			.catch((err) => {
				console.error("Error deleting training day:", err);
				const error = new Error("Failed to delete training day.");
				error.statusCode = 500;
				throw error;
			});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getTrainingDay = (req, res, next) => {
	try {
		const dayId = req.params.dayId;

		TrainingDay.findById(dayId)
			.populate("plan")
			.populate("exercises")
			.then((day) => {
				if (!day) {
					const error = new Error("Training day not found.");
					error.statusCode = 404;
					throw error;
				}
				res.status(200).json({
					message: "Training day retrieved successfully",
					trainingDay: day,
				});
			})
			.catch((err) => {
				console.error("Error retrieving training day:", err);
				const error = new Error("Failed to retrieve training day.");
				error.statusCode = 500;
				throw error;
			});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getTrainingDaysByPlan = (req, res, next) => {
	try {
		const planId = req.params.planId;

		TrainingDay.find({ plan: planId })
			.populate("exercises")
			.sort({ number: 1 })
			.then((days) => {
				res.status(200).json({
					message: "Training days retrieved successfully",
					trainingDays: days,
				});
			})
			.catch((err) => {
				console.error("Error retrieving training days:", err);
				const error = new Error("Failed to retrieve training days.");
				error.statusCode = 500;
				throw error;
			});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
