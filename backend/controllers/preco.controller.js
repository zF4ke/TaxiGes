const Preco = require('../models/preco.model');

// --- Obter todos os preços existentes ---
exports.getPrecos = async (req, res) => {
    try {
        const precos = await Preco.find();
        res.json(precos);
    } catch (err) {
        res.status(500).json({ message: err.message });
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