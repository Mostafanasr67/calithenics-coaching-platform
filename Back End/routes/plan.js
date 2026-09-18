const express = require('express');
const planController = require('../controllers/plan');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


router.get('/clients/:id/plan', isAuth, planController.getPlan);

router.get('/clients/:id/plan/:planId', isAuth, planController.getPlanById);

router.post('/clients/:id/plan', isAuth, planController.createPlan);

router.patch('/clients/:id/plan', isAuth, planController.updatePlan);   

router.delete('/clients/:id/plan/:planId', isAuth, planController.deletePlan);

router.post('/plans/:planId/week/:weekNumber/feedback', isAuth, planController.addWeekFeedback);

module.exports = router;