const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const exerciseController = require("../controllers/exercise");

// POST /exercises - Create a new exercise
router.post("/exercises", isAuth, exerciseController.createExercise);

// GET /exercises/:exerciseId - Get exercise by ID
router.get("/exercises/:exerciseId", isAuth, exerciseController.getExercise);

// GET /trainingDays/:dayId/exercises - Get all exercises for a training day
router.get(
  "/trainingDays/:dayId/exercises",
  isAuth,
  exerciseController.getExercisesByDay
);

// PATCH /exercises/:exerciseId - Update exercise
router.patch("/exercises/:exerciseId", isAuth, exerciseController.updateExercise);

// DELETE /exercises/:exerciseId - Delete exercise
router.delete(
  "/exercises/:exerciseId",
  isAuth,
  exerciseController.deleteExercise
);

module.exports = router;
