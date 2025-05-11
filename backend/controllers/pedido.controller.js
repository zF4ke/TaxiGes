const Pedido = require('../models/pedido.model');
const Motorista = require('../models/motorista.model');
const Cliente = require('../models/cliente.model');

// Listar todos os pedidos
exports.getAllPedidos = async (req, res) => {
  try {
    // const pedidos = await Pedido.find()
    //   .populate('motoristaSelecionado', 'pessoa')
    //   .populate('motoristasRejeitados', 'pessoa');
    // res.json(pedidos);

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
      .populate('cliente', 'pessoa')
      .populate('motoristaSelecionado', 'pessoa')
      .populate('motoristasRejeitados', 'pessoa');

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Criar um novo pedido
exports.createPedido = async (req, res) => {
  try {
    let clienteData = req.body.cliente;
    if (!clienteData?.pessoa?.nif) {
      return res.status(400).json({ message: 'NIF do cliente é obrigatório.' });
    }

    console.log('Cliente data:', clienteData);

    // Verifica se o cliente já existe pelo NIF
    let clienteExistente = await Cliente.findOne({ 'pessoa.nif': clienteData.pessoa.nif });

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
      .populate('cliente', 'pessoa')
      .populate('motoristaSelecionado', 'pessoa')
      .populate('motoristasRejeitados', 'pessoa');
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Atualizar um pedido por ID
exports.updatePedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const pedido = await Pedido.findOne({
      status: 'aceite',
      'motoristaSelecionado._id': motoristaId
    }).sort({ updatedAt: -1 });

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

    const pedido = await Pedido.findById(pedidoId);
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

    pedido.motoristaSelecionado = {
      _id: motorista._id,
      pessoa: motorista.pessoa
    };

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
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });

    // Verifica se o pedido já foi aceite
    if (pedido.status === 'aceite') {
      return res.status(400).json({ message: 'Não é possível cancelar um pedido aceite.' });
    }
    
    await Pedido.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelado' },
      { new: true }
    );
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

    const pedido = await Pedido.findById(pedidoId);
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
    const pedido = await Pedido.findById(pedidoId);

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