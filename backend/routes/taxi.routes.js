const express = require('express');
const router = express.Router();
const taxiController = require('../controllers/taxi.controller');

// List all taxis
router.get('/', taxiController.getAllTaxis);

// Create new taxi
router.post('/', taxiController.createTaxi);

// Delete taxi by ID
router.delete('/:id', taxiController.deleteTaxiById);

module.exports = router;