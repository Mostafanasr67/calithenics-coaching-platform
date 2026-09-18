const express = require("express");
const workoutSessionController = require("../controllers/workoutSession");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get('/workoutSessions/:sessionId', isAuth, workoutSessionController.getWorkoutSessionbyId);

router.get('/plans/:planId/workoutSessions/:weekNo', isAuth, workoutSessionController.getWorkoutSessionsByPlan);

router.get('/clients/:clientId/plans/:planId/workoutSessions/:sessionId', isAuth, workoutSessionController.getWorkoutSession)

router.get('/clients/:clientId/plans/:planId/workoutSessions', isAuth, workoutSessionController.getWorkoutSessionsByPlan);

router.post('/workoutSessions', isAuth, workoutSessionController.createWorkoutSession)

router.patch('/workoutSessions/:sessionId', isAuth, workoutSessionController.updateWorkoutSession)

router.delete('/workoutSessions/:sessionId', isAuth, workoutSessionController.deleteWorkoutSession)

module.exports = router;