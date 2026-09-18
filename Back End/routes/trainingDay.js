const express = require('express');
const trainingDayController = require('../controllers/trainingDay');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// Create a new training day
router.post('/trainingDays', isAuth, trainingDayController.createTrainingDay);

// Get a specific training day
router.get('/trainingDays/:dayId', isAuth, trainingDayController.getTrainingDay);

// Get all training days for a plan
router.get('/plans/:planId/trainingDays', isAuth, trainingDayController.getTrainingDaysByPlan);

// Update a training day
router.patch('/trainingDays/:dayId', isAuth, trainingDayController.updateTrainingDay);

// Delete a training day
router.delete('/trainingDays/:dayId', isAuth, trainingDayController.deleteTrainingDay);

module.exports = router;
