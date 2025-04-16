const express = require('express');
const router = express.Router();
const taxiController = require('../controllers/taxi.controller');

// List all taxis
router.get('/', taxiController.getAllTaxis);

module.exports = router;