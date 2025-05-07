const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');

// List all clientes
router.get('/', clienteController.getAllClientes);

// Create a new cliente
router.post('/', clienteController.createCliente);

// Get a specific cliente by ID
router.get('/:id', clienteController.getClienteById);

// Update a cliente by ID
router.put('/:id', clienteController.updateClienteById);

// Delete a cliente by ID
router.delete('/:id', clienteController.deleteClienteById);

module.exports = router;
