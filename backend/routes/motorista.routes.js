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

// GET /api/motoristas/relatorio - Obter relatorio de motoristas
router.get('/relatorio', motoristaController.getRelatorioMotoristas);

//delete
router.delete('/:id', motoristaController.deleteMotorista);

//get /api/motoristas/:id - Obter um motorista por ID
router.get('/:id', motoristaController.getMotoristaById);

//put /api/motoristas/:id - Atualizar um motorist
router.put('/:id', motoristaController.updateMotorista);

module.exports = router;