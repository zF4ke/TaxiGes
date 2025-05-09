const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

// List all pedidos
router.get('/', pedidoController.getAllPedidos);

// Create a new pedido
router.post('/', pedidoController.createPedido);

// Get a specific pedido by ID
router.get('/:id', pedidoController.getPedidoById);

// Update a pedido by ID
router.put('/:id', pedidoController.updatePedidoById);

// Delete a pedido by ID
router.delete('/:id', pedidoController.deletePedidoById);

module.exports = router;
