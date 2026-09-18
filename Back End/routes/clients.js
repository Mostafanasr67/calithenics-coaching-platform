const express = require('express');
const isAuth = require('../middleware/is-auth');
const clientController = require('../controllers/clients');
const planController = require('../controllers/plan');

const router = express.Router();

// GET /clients - list all clients for coach
router.get('/', isAuth, clientController.getClients);

// POST /clients - create a new client
router.post('/', isAuth, clientController.createClient);

// GET /clients/:id - get specific client
router.get('/:id', isAuth, clientController.getClientById);

router.patch('/:id', isAuth, clientController.updateClient);

router.delete('/:id', isAuth, clientController.deleteClient);




module.exports = router;
