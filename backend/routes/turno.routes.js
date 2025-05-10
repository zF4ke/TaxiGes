const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turno.controller');

// List all turnos
// router.get('/', turnoController.getAllTurnos);

// // Create a new turno
router.post('/', turnoController.createTurno);

// Get a specific turno by ID
router.get('/motorista/:motoristaId', turnoController.getTurnosByMotoristaId);

// // Update a turno by ID
// router.put('/:id', turnoController.updateTurnoById);

// // Delete a turno by ID
// router.delete('/:id', turnoController.deleteTurnoById);

router.get('/taxis-disponiveis', turnoController.getAvailableTaxis);

module.exports = router;
