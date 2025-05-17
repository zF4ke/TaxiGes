const Turno = require('../models/turno.model');
const Taxi = require('../models/taxi.model');
const Motorista = require('../models/motorista.model');

exports.createTurno = async (req, res) => {
  try {
    const { inicio, fim, taxiId, motoristaId } = req.body;

    if (!inicio || !fim || !taxiId || !motoristaId) {
      return res.status(400).json({ message: 'Campos obrigatórios: inicio, fim, taxiId, motoristaId.' });
    }

    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);

    const turnoTaxiExistente = await Turno.findOne({
      taxi: taxiId,
      $or: [
        { inicio: { $lt: fimDate }, fim: { $gt: inicioDate } },
      ],
    });

    if (turnoTaxiExistente) {
      return res.status(400).json({ message: 'O táxi já está reservado para este período.' });
    }

    const taxi = await Taxi.findById(taxiId);
    if (!taxi) {
        return res.status(404).json({ message: 'Táxi não encontrado.' });
    }

    const motorista = await Motorista.findById(motoristaId);
    if (!motorista) {
        return res.status(404).json({ message: 'Motorista não encontrado.' });
    }

    const novoTurno = new Turno({
      inicio: inicioDate,
      fim: fimDate,
      motorista,
      taxi
    });

    await novoTurno.save();
    res.status(201).json(novoTurno);
  } catch (err) {
    console.error('Erro ao criar turno:', err.message);
    res.status(500).json({ message: `Erro ao criar turno: ${err.message}` });
  }
};

exports.getTurnoById = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findById(id)
      .populate('motorista')
      .populate('taxi');

    if (!turno) {
      return res.status(404).json({ message: 'Turno não encontrado.' });
    }
    res.status(200).json(turno);
  } catch (err) {
    console.error('Erro ao buscar turno:', err.message);
    res.status(500).json({ message: `Erro ao buscar turno: ${err.message}` });
  }
};

exports.getAvailableTaxis = async (req, res) => {
  const { inicio, fim } = req.query;

  if (!inicio || !fim) {
    return res.status(400).json({ message: 'Parametros "inicio" e "fim" são obrigatórios.' });
  }

  const inicioDate = new Date(inicio);
  const fimDate = new Date(fim);
  const agora = new Date();

  // if (inicioDate <= agora) {
  //   return res.status(400).json({ message: 'O inicio do turno deve ser posterior a hora atual.' });
  // }

  if (fimDate <= inicioDate) {
    return res.status(400).json({ message: 'O fim do turno deve ser posterior ao inicio.' });
  }

  const duracaoMs = fimDate.getTime() - inicioDate.getTime();
  if (duracaoMs > 8 * 60 * 60 * 1000) {
    return res.status(400).json({ message: 'A duração do turno não pode exceder 8 horas.' });
  }

  try {
    const turnosIndisponiveis = await Turno.find({
      $or: [
        { inicio: { $lt: fimDate }, fim: { $gt: inicioDate } },
      ],
    }).select('taxi');

    const indisponiveisIds = turnosIndisponiveis.map((turno) => turno.taxi.toString());

    const taxisDisponiveis = await Taxi.find({
      _id: { $nin: indisponiveisIds },
      marca: { $exists: true, $ne: '' },
      modelo: { $exists: true, $ne: '' },
    });

    res.status(200).json(taxisDisponiveis);
  } catch (err) {
    console.error('Erro ao buscar táxis disponíveis:', err);
    res.status(500).json({ message: 'Erro ao buscar táxis disponíveis.' });
  }
};

exports.getTurnosByMotoristaId = async (req, res) => {
  console.log('getTurnosByMotoristaId chamado!', req.params.motoristaId);
  try {
    const { motoristaId } = req.params;

    if (!motoristaId) {
      return res.status(400).json({ message: 'Motorista ID é obrigatório.' });
    }

    const turnos = await Turno.find({ motorista: motoristaId })
      .sort({ inicio: 1 }) // Ordena ascendentemente por data do inicio do pedido
      .populate('motorista')
      .populate('taxi')
      .exec();

    res.status(200).json(turnos);
  } catch (err) {
    console.error('Erro ao buscar turnos do motorista:', err);
    res.status(500).json({ message: 'Erro ao buscar turnos do motorista.' });
  }
};

exports.checkMotoristaTurno = async (req, res) => {
  const { motoristaId, inicio, fim } = req.body;

  if (!motoristaId || !inicio || !fim) {
    return res.status(400).json({ message: 'Campos obrigatórios: motoristaId, inicio, fim.' });
  }

  const inicioDate = new Date(inicio);
  const fimDate = new Date(fim);

  try {
    const turnoExistente = await Turno.findOne({
      motorista: motoristaId,
      $or: [
        { inicio: { $lt: fimDate }, fim: { $gt: inicioDate } }, // Sobreposição de horários
      ],
    });

    if (turnoExistente) {
      return res.status(400).json({ message: 'O motorista já tem um turno marcado para este período.' });
    }

    res.status(200).json({ message: 'Disponível' });
  } catch (err) {
    console.error('Erro ao verificar turno do motorista:', err.message);
    res.status(500).json({ message: 'Erro ao verificar turno do motorista.' });
  }
};

exports.getTurnoAtivo = async (req, res) => {
  try {
    const motoristaId = req.params.motoristaId;
    const agora = new Date();
    const turno = await Turno.findOne({
      motorista: motoristaId,
      inicio: { $lte: agora },
      fim: { $gte: agora }
    }).populate('motorista')
      .populate('taxi');
      
    if (!turno) {
      return res.status(404).json({ message: 'Nenhum turno ativo encontrado.' });
    }
    res.json(turno);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};