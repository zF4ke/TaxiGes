const express = require('express');
const router = express.Router();
const taxiController = require('../controllers/taxi.controller');

// List all taxis
router.get('/', taxiController.getAllTaxis);

// Create new taxi
router.post('/', taxiController.createTaxi);

// Relatório de viagens por táxi
router.get('/relatorio', taxiController.getRelatorioTaxis);

module.exports = router;