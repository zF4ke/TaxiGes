const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turno.controller');

// List all turnos
// router.get('/', turnoController.getAllTurnos);

// Create a new turno
router.post('/', turnoController.createTurno);

// Check if the driver is available for a specific shift
router.post('/check-motorista-turno', turnoController.checkMotoristaTurno);

// Get a specific turno by ID
router.get('/motorista/:motoristaId', turnoController.getTurnosByMotoristaId);

// // Update a turno by ID
// router.put('/:id', turnoController.updateTurnoById);

// // Delete a turno by ID
// router.delete('/:id', turnoController.deleteTurnoById);

router.get('/taxis-disponiveis', turnoController.getAvailableTaxis);

//Obter turno do motorista
router.get('/ativo/:motoristaId', turnoController.getTurnoAtivo);

router.get('/:id', turnoController.getTurnoById);

module.exports = router;