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

// A URL será: GET /api/viagens/motorista/:motoristaId
router.get('/motorista/:motoristaId', viagemController.findViagensByMotorista);

// Update end of viagem
router.patch('/:id/fim', viagemController.updateFimViagem);

module.exports = router;
