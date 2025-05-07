const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motorista.controller');

// POST /api/motoristas - Criar novo motorista
router.post('/', motoristaController.createMotorista);

// GET /api/motoristas - Listar todos os motoristas
router.get('/', motoristaController.getAllMotoristas);

// GET /api/motoristas/localidade/:cp - Obter localidade por código postal
router.get('/localidade/:cp', motoristaController.getLocalityByPostalCode);

// GET 
router.get('/para-selecao', motoristaController.listarParaSelecao);

//POST  
router.post('/acesso-nif', motoristaController.acessoPorNIF);

module.exports = router;