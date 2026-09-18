const Exercise = require("../models/exercise");
const TrainingDay = require("../models/trainingDay");

// Create a new exercise
const createExercise = async (req, res, next) => {
  try {
    const { day, name, sets, reps, weight, rest, tempo, rir, notes } = req.body;

    // Validate required fields
    if (!day || !name) {
      return res.status(400).json({
        success: false,
        message: "Training day and exercise name are required",
      });
    }

    // Create exercise document
    const exercise = new Exercise({
      day,
      name,
      sets: sets || "",
      reps: reps || "",
      weight: weight || "",
      rest: rest || "",
      tempo: tempo || "",
      rir: rir || "",
      notes: notes || "",
    });

    const savedExercise = await exercise.save();

    // Add exercise to training day's exercises array
    await TrainingDay.findByIdAndUpdate(
      day,
      { $push: { exercises: savedExercise._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      exercise: savedExercise,
    });
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({
      success: false,
      message: "Error creating exercise",
      error: error.message,
    });
  }
};

// Get exercise by ID
const getExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await Exercise.findById(exerciseId).populate("day");

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.status(200).json({
      success: true,
      exercise,
    });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exercise",
      error: error.message,
    });
  }
};

// Update exercise
const updateExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;
    const { name, sets, reps, weight, rest, tempo, rir, notes } = req.body;

    const updatedExercise = await Exercise.findByIdAndUpdate(
      exerciseId,
      {
        $set: {
          name: name || undefined,
          sets: sets || undefined,
          reps: reps || undefined,
          weight: weight || undefined,
          rest: rest || undefined,
          tempo: tempo || undefined,
          rir: rir || undefined,
          notes: notes || undefined,
        },
      },
      { new: true }
    );

    if (!updatedExercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exercise updated successfully",
      exercise: updatedExercise,
    });
  } catch (error) {
    console.error("Error updating exercise:", error);
    res.status(500).json({
      success: false,
      message: "Error updating exercise",
      error: error.message,
    });
  }
};

// Delete exercise
const deleteExercise = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;

    const exercise = await Exercise.findByIdAndDelete(exerciseId);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    // Remove exercise from training day's exercises array
    await TrainingDay.findByIdAndUpdate(
      exercise.day,
      { $pull: { exercises: exerciseId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Exercise deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting exercise",
      error: error.message,
    });
  }
};

// Get all exercises for a training day
const getExercisesByDay = async (req, res, next) => {
  try {
    const { dayId } = req.params;

    const exercises = await Exercise.find({ day: dayId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      exercises,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching exercises",
      error: error.message,
    });
  }
};

module.exports = {
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise,
  getExercisesByDay,
};
