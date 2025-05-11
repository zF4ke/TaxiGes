const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

// Get pedidos que incedem em turnos de motoristas
router.get('/filtrados-por-turno', pedidoController.getPedidosFiltradosPorTurno);

// List all pedidos
router.get('/', pedidoController.getAllPedidos);

// Create a new pedido
router.post('/', pedidoController.createPedido);

// Selecionar um pedido 
router.put('/:id/selecionar-motorista', pedidoController.selecionarPedido);

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

// Rejeitar motorista de um pedido
router.put('/:id/rejeitar-motorista', pedidoController.rejeitarMotorista);

// Cliente aceita ou rejeita motorista
router.put('/:id/aceitar-motorista', pedidoController.aceitarMotorista);


module.exports = router;
