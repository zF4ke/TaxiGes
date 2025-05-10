const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');
const Pedido = require('../models/pedido.model'); 

// List all pedidos
router.get('/', pedidoController.getAllPedidos);

// Create a new pedido
router.post('/', pedidoController.createPedido);

// Aceitar um pedido 
router.put('/:id/aceitar', pedidoController.aceitarPedido);

// Get a specific pedido by ID
router.get('/:id', pedidoController.getPedidoById);

// Update a pedido by ID
router.put('/:id', pedidoController.updatePedidoById);

// Delete a pedido by ID
router.delete('/:id', pedidoController.deletePedidoById);

// Get the last accepted pedido by motorista ID
router.get('/ultimo-aceite/:motoristaId', pedidoController.getUltimoPedidoAceiteByMotorista);

// Cancelar um pedido por ID
router.put('/:id/cancelar', pedidoController.cancelarPedido);


module.exports = router;
