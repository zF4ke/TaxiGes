const mongoose = require('mongoose');
const Pedido = require('../models/pedido.model');
const Motorista = require('../models/motorista.model');
const Cliente = require('../models/cliente.model');
const Turno = require('../models/turno.model');

// Listar todos os pedidos
exports.getAllPedidos = async (req, res) => {
  try {
    const { status, motoristaId } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    // motoristaId nao esta no motoristasRejeitados
    if (motoristaId) {
      filter.motoristasRejeitados = { $ne: motoristaId };
    }

    const pedidos = await Pedido.find(filter)
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPedidosFiltradosPorTurno = async (req, res) => {
  try {
    const { motoristaId } = req.query;
    console.log('[getPedidosFiltradosPorTurno] Motorista ID recebido:', motoristaId);

    // Validar se o motoristaId é um ObjectId válido
    if (!motoristaId || !mongoose.Types.ObjectId.isValid(motoristaId)) {
      console.error('[getPedidosFiltradosPorTurno] ID do motorista inválido:', motoristaId);
      return res.status(400).json({ message: 'ID do motorista inválido ou não fornecido.' });
    }

    // Buscar o turno ativo do motorista
    const agora = new Date();
    console.log('[getPedidosFiltradosPorTurno] Data e hora atual:', agora);

    const turnoAtivo = await Turno.findOne({
      motorista: motoristaId,
      inicio: { $lte: agora },
      fim: { $gte: agora },
    })
      .populate('motorista')
      .populate('taxi');

    if (!turnoAtivo) {
      console.warn('[getPedidosFiltradosPorTurno] Nenhum turno ativo encontrado para o motorista:', motoristaId);
      return res.status(400).json({ message: 'Nenhum turno ativo encontrado para o motorista.' });
    }

    console.log('[getPedidosFiltradosPorTurno] Turno ativo encontrado:', turnoAtivo);

    // Filtrar pedidos dentro do turno ativo
    const pedidos = await Pedido.find({
      status: 'pendente',
      nivelConforto: turnoAtivo.taxi.conforto,
      createdAt: { $gte: turnoAtivo.inicio, $lte: turnoAtivo.fim },
      motoristasRejeitados: { $ne: motoristaId }
    })
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');

    console.log('[getPedidosFiltradosPorTurno] Pedidos encontrados:', pedidos);

    res.json(pedidos);
  } catch (err) {
    console.error('[getPedidosFiltradosPorTurno] Erro ao buscar pedidos filtrados por turno:', err);
    res.status(500).json({ message: 'Erro ao buscar pedidos.' });
  }
};

// Criar um novo pedido
exports.createPedido = async (req, res) => {
  try {
    let clienteData = req.body.cliente;
    if (!clienteData?.nif) {
      return res.status(400).json({ message: 'NIF do cliente é obrigatório.' });
    }

    console.log('Cliente data:', clienteData);

    // Verifica se o cliente já existe pelo NIF
    let clienteExistente = await Cliente.findOne({ 'nif': clienteData.nif });

    console.log('Cliente existente:', clienteExistente);

    // Se não existir, cria novo
    if (!clienteExistente) {
      const novoCliente = new Cliente(clienteData);
      clienteExistente = await novoCliente.save();
    }

    // Cria o pedido com referência ao cliente existente
    const pedido = new Pedido({
      ...req.body,
      cliente: clienteExistente._id
    });

    await pedido.save();
    res.status(201).json(pedido);
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(400).json({ message: err.message });
  }
};

// Obter um pedido por ID
exports.getPedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Atualizar um pedido por ID
exports.updatePedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar um pedido por ID
exports.deletePedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json({ message: 'Pedido removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obter o último pedido aceite por motorista
exports.getUltimoPedidoAceiteByMotorista = async (req, res) => {
  try {
    const motoristaId = req.params.motoristaId;

    console.log('motoristaId:', motoristaId);

    const pedido = await Pedido.findOne({
      status: 'aceite',
      motoristaSelecionado: motoristaId
    }).sort({ updatedAt: -1 })
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');

    if (!pedido) return res.status(404).json({ message: 'Nenhum pedido aceite encontrado para este motorista.' });
    res.json(pedido);
  } catch (err) {
    console.error('Erro no getUltimoPedidoAceiteByMotorista:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.selecionarPedido = async (req, res) => {
  console.log('selecionarPedido chamado!', req.params.id, req.body);
  try {
    const pedidoId = req.params.id;
    const { motoristaId, motoristaCoords } = req.body;

    const pedido = await Pedido.findById(pedidoId)
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const motorista = await Motorista.findById(motoristaId);
    if (!motorista) return res.status(404).json({ message: 'Motorista não encontrado.' });

    if (pedido.motoristasRejeitados.includes(motoristaId)) {
      return res.status(400).json({ message: 'Motorista já rejeitado para este pedido.' });
    }

    // Verifica se o motorista já foi selecionado
    if (pedido.motoristaSelecionado) {
      return res.status(400).json({ message: 'Motorista já selecionado para este pedido.' });
    }

    pedido.motoristaSelecionado = motorista

    // Atualiza as coordenadas do motorista
    if (motoristaCoords) {
      pedido.motoristaCoords = motoristaCoords;
    }

    await pedido.save();
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });

    // Verifica se o pedido já foi aceite
    if (pedido.status === 'aceite') {
      return res.status(400).json({ message: 'Não é possível cancelar um pedido aceite.' });
    }
    
    await Pedido.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelado' },
      { new: true }
    )
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejeitarMotorista = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const { motoristaId } = req.body;

    const pedido = await Pedido.findById(pedidoId)
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });

    if (!motoristaId) {
      return res.status(400).json({ message: 'ID do motorista é obrigatório.' });
    }

    const motorista = await Motorista.findById(motoristaId);
    if (!motorista) return res.status(404).json({ message: 'Motorista não encontrado.' });

    // Verifica se o motorista já foi rejeitado
    if (pedido.motoristasRejeitados.includes(motoristaId)) {
      return res.status(400).json({ message: 'Motorista já rejeitado para este pedido.' });
    }

    // Verifica se o pedido já foi aceite
    if (pedido.status === 'aceite') {
      return res.status(400).json({ message: 'Não é possível rejeitar um motorista para um pedido aceite.' });
    }

    // Remove o motorista selecionado se for o mesmo
    if (pedido.motoristaSelecionado && pedido.motoristaSelecionado._id.toString() === motoristaId) {
      pedido.motoristaSelecionado = null;
      pedido.status = 'pendente';
      pedido.motoristasRejeitados.push({
        _id: motoristaId
      });
      pedido.motoristaCoords = null;

      await pedido.save();
      return res.json(pedido);
    } else {
      return res.status(400).json({ message: 'Motorista não corresponde ao selecionado.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cliente aceita ou rejeita motorista
exports.aceitarMotorista = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const pedido = await Pedido.findById(pedidoId)
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Verifica se o motorista foi selecionado
    if (!pedido.motoristaSelecionado) {
      return res.status(400).json({ message: 'Nenhum motorista selecionado para este pedido.' });
    }

    pedido.clienteAceitouMotorista = true;
    pedido.status = 'aceite';

    await pedido.save();
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};