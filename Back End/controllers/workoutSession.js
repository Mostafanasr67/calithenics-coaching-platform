const workoutSession = require("../models/workoutSession");

exports.getWorkoutSessionbyId = async (req, res, next) => {
	const sessionId = req.params.sessionId;

	try {
		const session = await workoutSession
			.findById(sessionId)
			.populate("exercises.exercise")
			.populate("trainingDay");
		if (!session) {
			return res.status(404).json({ message: "Workout session not found" });
		}

		res.status(200).json({ workoutSession: session });
	} catch (err) {
		console.error("Error retrieving workout session:", err);
		res.status(500).json({ message: "Failed to retrieve workout session" });
	}
};

exports.getWorkoutSessionsByPlan = async (req, res, next) => {
	const { planId, weekNo } = req.params;

	try {
		// Validate both required parameters
		if (!planId || !weekNo) {
			return res.status(400).json({ message: "Missing required parameters: planId and weekNo" });
		}
		
		const sessions = await workoutSession
			.find({ 
				plan: planId,
				weekNumber: parseInt(weekNo)
			})
			.populate("exercises.exercise")
			.populate("trainingDay");

		res.status(200).json({ workoutSessions: sessions });
	} catch (err) {
		console.error("Error retrieving workout sessions:", err);
		res.status(500).json({ message: "Failed to retrieve workout sessions" });
	}
};

exports.getWorkoutSession = async (req, res, next) => {
	const { clientId, planId, sessionId } = req.params;

	try {
		const session = await workoutSession
			.findById(sessionId)
			.populate("exercises.exercise")
			.populate("trainingDay");
		if (!session) {
			return res.status(404).json({ message: "Workout session not found" });
		}

		// Check if the session belongs to the specified client
		if (clientId && session.client.toString() !== clientId) {
			return res
				.status(400)
				.json({
					message: "Workout session does not belong to the specified client",
				});
		}

		// Check if the session belongs to the specified plan
		if (planId && session.plan.toString() !== planId) {
			return res
				.status(400)
				.json({
					message: "Workout session does not belong to the specified plan",
				});
		}

		res.status(200).json({ workoutSession: session });
	} catch (err) {
		console.error("Error retrieving workout session:", err);
		res.status(500).json({ message: "Failed to retrieve workout session" });
	}
};


exports.createWorkoutSession = async (req, res, next) => {
    const { client, plan, trainingDay, weekNumber, status, exercises } = req.body;

    try {
        // Validate required fields
        if (!client || !plan || !trainingDay || !status) {
            return res.status(400).json({ message: "Missing required fields: client, plan, trainingDay, status" });
        }

        const newSession = new workoutSession({
            client,
            plan,
            trainingDay,
            weekNumber,
            status,
            exercises,
        });

        const savedSession = await newSession.save();
        res.status(201).json({ message: "Workout session created", workoutSession: savedSession });
    } catch (err) {
        console.error("Error creating workout session:", err);
        res.status(500).json({ message: "Failed to create workout session", error: err.message });
    }
};


exports.updateWorkoutSession = async (req, res, next) => {
    const sessionId = req.params.sessionId;
    const updateData = req.body;

    try {
        const updatedSession = await workoutSession.findByIdAndUpdate(sessionId, updateData, { new: true })
            .populate("exercises.exercise")
            .populate("trainingDay");
        if (!updatedSession) {
            return res.status(404).json({ message: "Workout session not found" });
        }

        res.status(200).json({ message: "Workout session updated", workoutSession: updatedSession });
    } catch (err) {
        console.error("Error updating workout session:", err);
        res.status(500).json({ message: "Failed to update workout session" });
    }
};

exports.deleteWorkoutSession = async (req, res, next) => {
    const sessionId = req.params.sessionId;

    try {
        const deletedSession = await workoutSession.findByIdAndDelete(sessionId);
        if (!deletedSession) {
            return res.status(404).json({ message: "Workout session not found" });
        }

        res.status(200).json({ message: "Workout session deleted", workoutSession: deletedSession });
    } catch (err) {
        console.error("Error deleting workout session:", err);
        res.status(500).json({ message: "Failed to delete workout session" });
    }
};