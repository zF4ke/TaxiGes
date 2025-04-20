const express = require('express');
const router = express.Router();
const precoController = require('../controllers/preco.controller');

//List the prices
router.get('/', precoController.getPrecos);

// Create new price
router.post('/', precoController.createPreco);

// Update price
router.put('/:id', precoController.atualizarPreco);

module.exports = router;