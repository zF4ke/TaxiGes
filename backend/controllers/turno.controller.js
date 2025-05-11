const Turno = require('../models/turno.model');
const Taxi = require('../models/taxi.model');
const Motorista = require('../models/motorista.model');

exports.createTurno = async (req, res) => {
  try {
    const { inicio, fim, taxiId, motoristaId } = req.body;

    if (!inicio || !fim || !taxiId || !motoristaId) {
      return res.status(400).json({ message: 'Campos obrigatórios: inicio, fim, taxiId, motoristaId.' });
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
      inicio: new Date(inicio),
      fim: new Date(fim),
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

exports.getAvailableTaxis = async (req, res) => {
  const { inicio, fim } = req.query;

  if (!inicio || !fim) {
    return res.status(400).json({ message: 'Parâmetros "inicio" e "fim" são obrigatórios.' });
  }

  try {
    const taxisIndisponiveis = await Turno.aggregate([
      {
        $match: {
          $or: [
            { inicio: { $lt: new Date(fim) }, fim: { $gt: new Date(inicio) } },
          ],
        },
      },
      {
        $group: {
          _id: '$taxi._id', // Agrupa pelos IDs dos táxis
        },
      },
    ]).exec();

    const indisponiveisIds = taxisIndisponiveis.map((t) => t._id);

    const taxisDisponiveis = await Taxi.find({
      _id: { $nin: indisponiveisIds },
    });

    res.status(200).json(taxisDisponiveis);
  } catch (err) {
    console.error('Erro ao buscar táxis disponíveis:', err);
    res.status(500).json({ message: 'Erro ao buscar táxis disponíveis.' });
  }
};

exports.getTurnosByMotoristaId = async (req, res) => {
  try {
    const { motoristaId } = req.params;

    if (!motoristaId) {
      return res.status(400).json({ message: 'Motorista ID é obrigatório.' });
    }

    const turnos = await Turno.find({ 'motorista._id': motoristaId })
      .sort({ inicio: 1 }) // Ordena ascendentemente por data do inicio do pedido
      .populate('taxi', 'marca modelo conforto')
      .exec();

    res.status(200).json(turnos);
  } catch (err) {
    console.error('Erro ao buscar turnos do motorista:', err);
    res.status(500).json({ message: 'Erro ao buscar turnos do motorista.' });
  }
};