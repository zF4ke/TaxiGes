const Pedido = require('../models/pedido.model');
const Motorista = require('../models/motorista.model');

// Listar todos os pedidos
exports.getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Criar um novo pedido
exports.createPedido = async (req, res) => {
  try {
    const pedido = new Pedido(req.body);
    await pedido.save();
    res.status(201).json(pedido);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obter um pedido por ID
exports.getPedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
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
      motorista: motoristaId,
      estado: 'aceito'
    }).sort({ updatedAt: -1 }); 

    if (!pedido) return res.status(404).json({ message: 'Nenhum pedido aceite encontrado para este motorista.' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.aceitarPedido = async (req, res) => {
  console.log('aceitarPedido chamado!', req.params.id, req.body);
  try {
    const pedidoId = req.params.id;
    const { motoristaId } = req.body;

    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const motorista = await Motorista.findById(motoristaId);
    if (!motorista) return res.status(404).json({ message: 'Motorista não encontrado.' });

    pedido.status = 'aceito';
    pedido.motoristaSelecionado = {
      _id: motorista._id,
      pessoa: motorista.pessoa
    };
    await pedido.save();

    res.json(pedido);
  } catch (err) {
    console.error('Erro ao aceitar pedido:', err); 
    res.status(500).json({ message: err.message });
  }
};

exports.cancelarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
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