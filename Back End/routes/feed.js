const express = require('express');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/
router.get('/', isAuth, feedController.getFeed);

router.post('/', isAuth, feedController.postFeed);

module.exports = router;