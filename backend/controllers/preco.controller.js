const Preco = require('../models/preco.model');

// --- Obter todos os preços existentes ---
exports.getPrecos = async (req, res) => {
    try {
        const precos = await Preco.find();
        res.status(200).json(precos);
    } catch (error) {
        console.error('Erro ao obter os preços:', error);
        res.status(500).json({ message: 'Erro ao obter os preços.' });
    }
};

exports.saveOrUpdatePreco = async (req, res) => {
    const { precoBasico, precoLuxo, agravamento } = req.body;
  
    try {
      let preco = await Preco.findOne();
      if (preco) {
        // Atualiza o documento existente
        preco.precoBasico = precoBasico;
        preco.precoLuxo = precoLuxo;
        preco.agravamento = agravamento;
        await preco.save();
        return res.status(200).json(preco);
      } else {
        // Cria o documento se não existir
        preco = new Preco({ precoBasico, precoLuxo, agravamento });
        await preco.save();
        return res.status(201).json(preco);
      }
    } catch (err) {
      console.error('Erro ao salvar preço:', err);
      res.status(500).json({ error: 'Erro ao salvar preço.' });
    }
  };

exports.atualizarPreco = async (req, res) => {
    const { id } = req.params;
    const { precoPorMinuto, agravamento } = req.body;

    console.log('[AtualizarPreco] Dados recebidos no backend:', { id, precoPorMinuto, agravamento });

    try {
        const updatedPreco = await Preco.findByIdAndUpdate(
            id,
            { ...(precoPorMinuto !== undefined && { precoPorMinuto }), ...(agravamento !== undefined && { agravamento }) },
            { new: true }
        );

        if (!updatedPreco) {
            return res.status(404).json({ error: 'Preço não encontrado.' });
        }

        res.status(200).json(updatedPreco);
    } catch (err) {
        console.error('Erro ao atualizar o preço:', err);
        res.status(500).json({ error: 'Erro ao atualizar o preço!' });
    }
};

// --- Obter preço por ID ---
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

// --- Criar um novo preço ---
exports.createPreco = async (req, res) => {
    const preco = new Preco({
        precoPorMinuto: req.body.precoPorMinuto,
        tipo: req.body.tipo,
        agravamento: req.body.agravamento
    });

    try {
        const precoExistente = await Preco.findOne({ tipo: req.body.tipo });
        if (precoExistente) {
            return res.status(400).json({ error: 'Já existe um preço para este tipo de conforto' });
        }
        
        const novoPreco = await preco.save();
        res.status(201).json(novoPreco);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// --- Atualizar um preço existente ---
exports.atualizarPreco = async (req, res) => {
    try {
        const preco = await Preco.findById(req.params.id);
        if (!preco) {
            return res.status(404).json({ message: 'Preço não encontrado' });
        }

        preco.precoPorMinuto = req.body.precoPorMinuto;
        preco.agravamento = req.body.agravamento;

        const precoAtualizado = await preco.save();
        res.json(precoAtualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// --- Eliminar preço por ID ---
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

// --- Simular preço de viagem ---
exports.simulateTravel = async (req, res) => {
    try {
        const { tipo, horaInicial, horaFinal } = req.body;

        // Get price configuration for the selected comfort type
        const preco = await Preco.findOne({ tipo });
        if (!preco) {
            return res.status(404).json({ message: 'Tipo de conforto não encontrado' });
        }

        // Calculate duration and night minutes
        const [horaInicio, minutoInicio] = horaInicial.split(':').map(Number);
        const [horaFim, minutoFim] = horaFinal.split(':').map(Number);

        const minutosInicio = horaInicio * 60 + minutoInicio;
        const minutosFim = horaFim * 60 + minutoFim;

        let duracao = minutosFim - minutosInicio;
        if (duracao < 0) {
            duracao += 24 * 60; // Add 24 hours in minutes
        }

        // Calculate night minutes (21:00 - 06:00)
        let minutosNoturnos = 0;
        for (let i = 0; i < duracao; i++) {
            const horaAtual = Math.floor((minutosInicio + i) / 60) % 24;
            if (horaAtual >= 21 || horaAtual < 6) {
                minutosNoturnos++;
            }
        }

        const minutosNormais = duracao - minutosNoturnos;

        // Calculate final price
        const precoEstimado =
            minutosNormais * preco.precoPorMinuto +
            minutosNoturnos * preco.precoPorMinuto * (1 + preco.agravamento / 100);

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