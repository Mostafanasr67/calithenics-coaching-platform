const Plan = require("../models/plan");
const User = require("../models/user");

exports.getPlan = (req, res, next) => {
	try {
		const id = req.params.id;

		Plan.find({ client: id })
			.populate({
				path: 'trainingDays',
				populate: {
					path: 'exercises'
				}
			})
			.then((plans) => {
				if (!plans || plans.length === 0) {
					return res.status(200).json({
						message: "No plans found.",
						plan: []
					});
				}
				res.status(200).json({
					message: "Plans fetched successfully",
					plan: plans
				});
			})
			.catch((err) => {
				console.error("Error fetching plan:", err);
				const error = new Error("Failed to fetch plan.");
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

exports.getPlanById = (req, res, next) => {
	try {
		const planId = req.params.planId;
		Plan.findById(planId)
			.populate({
				path: 'trainingDays',
				populate: {
					path: 'exercises'
				}
			})
			.then((plan) => {
				if (!plan) {
					return res.status(404).json({
						message: "Plan not found.",
						plan: null
					});
				}
				res.status(200).json({
					message: "Plan fetched successfully",
					plan: plan
				});
			})
			.catch((err) => {
				console.error("Error fetching plan:", err);
				const error = new Error("Failed to fetch plan.");
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

exports.createPlan = (req, res, next) => {
	try {
		const clientId = req.params.id;
		const { title, mainGoal, description, status, startDate, endDate, coachNotes } = req.body;

		// Validate required fields
		if (!title || !mainGoal || !description || !startDate || !endDate) {
			const error = new Error("Missing required fields for plan creation.");
			error.statusCode = 400;
			throw error;
		}

		// Create new plan
		const plan = new Plan({
			client: clientId,
			title,
			mainGoal,
			description,
			status: status || "Active",
			startDate: new Date(startDate),
			endDate: new Date(endDate),
			coachNotes: coachNotes || "",
			trainingDays: [],
		});

		plan.save()
			.then((savedPlan) => {
				res.status(201).json({
					message: "Plan created successfully",
					plan: savedPlan,
				});
			})
			.catch((err) => {
				console.error("Error saving plan:", err);
				const error = new Error("Failed to save plan.");
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

exports.updatePlan = (req, res, next) => {
	try {
		const clientId = req.params.id;
		const updateData = req.body;
		const planId = updateData._id || req.body.planId;

		// If a specific plan ID is provided, use it to ensure we update the correct plan
		// Otherwise, fall back to finding the first plan for this client (for backward compatibility)
		const query = planId ? 
			{ _id: planId, client: clientId } : 
			{ client: clientId };

		// Remove _id and planId from the update data to avoid overwriting the ID
		const dataToUpdate = { ...updateData };
		delete dataToUpdate._id;
		delete dataToUpdate.planId;

		Plan.findOneAndUpdate(
			query,
			{ $set: dataToUpdate },
			{ new: true }
		)
			.then((updatedPlan) => {
				if (!updatedPlan) {
					const error = new Error("Plan not found.");
					error.statusCode = 404;
					throw error;
				}
				res.status(200).json({
					message: "Plan updated successfully",
					plan: updatedPlan,
				});
			})
			.catch((err) => {
				console.error("Error updating plan:", err);
				const error = new Error("Failed to update plan.");
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

exports.deletePlan = (req, res, next) => {
	try {
		const clientId = req.params.id;
		const planId = req.params.planId;

		Plan.findOneAndDelete({ _id: planId, client: clientId })
			.then((deletedPlan) => {
				if (!deletedPlan) {
					const error = new Error("Plan not found.");
					error.statusCode = 404;
					throw error;
				}
				res.status(200).json({
					message: "Plan deleted successfully",
				});
			})
			.catch((err) => {
				console.error("Error deleting plan:", err);
				const error = new Error("Failed to delete plan.");
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

exports.addWeekFeedback = (req, res, next) => {
	try {
		const planId = req.params.planId;
		const weekNumber = parseInt(req.params.weekNumber, 10);
		const { feedback } = req.body;

		// Validate required fields
		if (!feedback || feedback.trim() === "") {
			const error = new Error("Feedback cannot be empty.");
			error.statusCode = 400;
			throw error;
		}

		if (isNaN(weekNumber) || weekNumber < 1) {
			const error = new Error("Invalid week number.");
			error.statusCode = 400;
			throw error;
		}

		Plan.findById(planId)
			.then((plan) => {
				if (!plan) {
					const error = new Error("Plan not found.");
					error.statusCode = 404;
					throw error;
				}

				// Check if feedback for this week already exists
				const existingFeedbackIndex = plan.weekFeedback.findIndex(
					(wf) => wf.weekNumber === weekNumber
				);

				if (existingFeedbackIndex !== -1) {
					// Update existing feedback
					plan.weekFeedback[existingFeedbackIndex].feedback = feedback;
					plan.weekFeedback[existingFeedbackIndex].createdAt = new Date();
				} else {
					// Add new feedback
					plan.weekFeedback.push({
						weekNumber,
						feedback,
						createdAt: new Date(),
					});
				}

				return plan.save();
			})
			.then((updatedPlan) => {
				res.status(200).json({
					message: "Feedback submitted successfully",
					plan: updatedPlan,
				});
			})
			.catch((err) => {
				console.error("Error adding week feedback:", err);
				if (!err.statusCode) {
					err.statusCode = 500;
				}
				next(err);
			});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
