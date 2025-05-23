const Preco = require('../models/preco.model');

// Listar todos os preços (só haverá um)
exports.getPrecos = async (req, res) => {
  try {
    const precos = await Preco.find();
    res.status(200).json(precos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter os preços.' });
  }
};

// Criar ou atualizar o único documento de preço
exports.saveOrUpdatePreco = async (req, res) => {
  const { precoBasico, precoLuxo, agravamento } = req.body;
  try {
    let preco = await Preco.findOne();
    if (preco) {
      preco.precoBasico = precoBasico;
      preco.precoLuxo = precoLuxo;
      preco.agravamento = agravamento;
      await preco.save();
      return res.status(200).json(preco);
    } else {
      preco = new Preco({ precoBasico, precoLuxo, agravamento });
      await preco.save();
      return res.status(201).json(preco);
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar preço.' });
  }
};

// Buscar preço por ID (opcional)
exports.getPrecoById = async (req, res) => {
  try {
    const preco = await Preco.findById(req.params.id);
    if (preco) {
      res.json(preco);
    } else {
      res.status(404).json({ message: 'Preço não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deletar preço por ID (opcional)
exports.deletePrecoById = async (req, res) => {
  try {
    const preco = await Preco.findById(req.params.id);
    if (!preco) {
      return res.status(404).json({ message: 'Preço não encontrado' });
    }
    await Preco.findByIdAndDelete(req.params.id);
    res.json({ message: 'Preço removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Simular viagem
exports.simulateTravel = async (req, res) => {
  try {
    const { tipo, horaInicial, horaFinal } = req.body;
    const preco = await Preco.findOne();
    if (!preco) {
      return res.status(404).json({ message: 'Preço não encontrado' });
    }

    // Calcular duração
    const [horaInicio, minutoInicio] = horaInicial.split(':').map(Number);
    const [horaFim, minutoFim] = horaFinal.split(':').map(Number);
    let minutosInicio = horaInicio * 60 + minutoInicio;
    let minutosFim = horaFim * 60 + minutoFim;
    let duracao = minutosFim - minutosInicio;
    if (duracao < 0) duracao += 24 * 60;

    // Calcular minutos noturnos (21h às 6h)
    let minutosNoturnos = 0;
    for (let i = 0; i < duracao; i++) {
      const horaAtual = Math.floor((minutosInicio + i) / 60) % 24;
      if (horaAtual >= 21 || horaAtual < 6) minutosNoturnos++;
    }
    const minutosNormais = duracao - minutosNoturnos;

    // Selecionar preço conforme tipo
    let precoPorMinuto = tipo === 'luxuoso' ? preco.precoLuxo : preco.precoBasico;

    // Calcular preço final
    const precoEstimado =
      minutosNormais * precoPorMinuto +
      minutosNoturnos * precoPorMinuto * (1 + preco.agravamento / 100);

    res.json({
      preco: precoEstimado,
      tipo,
      horaInicial,
      horaFinal
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};