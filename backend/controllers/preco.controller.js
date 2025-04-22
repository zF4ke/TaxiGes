const Preco = require('../models/preco.model');

//obter os precos existentes na BD (devem ser no maximo 2)
exports.getPrecos = async (req, res) => {
    try {
        const precos = await Preco.find();
        res.status(200).json(precos);
    } catch (error) {
        console.error('Erro ao obter os preços:', error);
        res.status(500).json({ message: 'Erro ao obter os preços.' });
    }
};

exports.createPreco = async (req, res) => {
    const { precoPorMinuto, tipo, agravamento } = req.body;

    console.log('[CreatePreco] Dados recebidos no backend:', { precoPorMinuto, tipo, agravamento });

    try {
        const newPreco = new Preco({ precoPorMinuto, tipo, agravamento });
        await newPreco.save();
        res.status(201).json(newPreco);
    } catch (err) {
        console.error('Erro ao criar preco:', err);

        if (err.code === 11000) {
            return res.status(400).json({ error: 'Já existe um preço para este tipo de conforto.' });
        }

        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }

        res.status(500).json({ error: 'Erro ao criar preço!' });
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

exports.getPrecoById = async (req, res) => {
    try {
        const preco = await Preco.findById(req.params.id);
        if (!preco) {
        return res.status(404).json({ error: 'Preço não encontrado.' });
        }
        res.status(200).json(preco);
    } catch (err) {
        console.error('Erro ao obter preço:', err);
        res.status(500).json({ error: 'Erro ao obter preço.' });
    }
};

exports.deletePrecoById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPreco = await Preco.deleteOne({ _id: id });

        if (!deletedPreco) {
            return res.status(404).json({ error: 'Preço não encontrado.' });
        }

        res.status(200).json({ message: 'Preço eliminado com sucesso!' });
    } catch (err) {
        console.error('Erro ao apagar preço:', err);
        res.status(500).json({ error: 'Erro ao apagar o preço.' });
    }
};