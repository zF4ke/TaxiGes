const express = require('express');
const router = express.Router();
const viagemController = require('../controllers/viagem.controller');

// List all viagens
router.get('/', viagemController.getAllViagens);

// Create a new viagem
router.post('/', viagemController.createViagem);

// Get a specific viagem by ID
router.get('/:id', viagemController.getViagemById);

// Delete a viagem by ID
router.delete('/:id', viagemController.deleteViagemById);

module.exports = router;
