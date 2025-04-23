const express = require('express');
const router = express.Router();
const precoController = require('../controllers/preco.controller');

//List the prices
router.get('/', precoController.getPrecos);

// Create new price
router.post('/', precoController.createPreco);

// Update price
router.put('/:id', precoController.atualizarPreco);

// Get price by id
router.get('/:id', precoController.getPrecoById);

// Delete price by id 
router.delete('/:id', precoController.deletePrecoById);

// Simulate travel price
router.post('/simulate', precoController.simulateTravel);

module.exports = router;