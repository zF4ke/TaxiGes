//Obter turno do motorista
router.get('/ativo/:motoristaId', turnoController.getTurnoAtivo);