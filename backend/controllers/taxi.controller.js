const Turno = require('../models/turno.model');
const Taxi = require('../models/taxi.model');
const Viagem = require('../models/viagem.model');

// --- Listar todos os Táxis ---
exports.getAllTaxis = async (req, res) => {
    try {
        const taxis = await Taxi.find().sort({ createdAt: -1 });
        return res.status(200).json(taxis);
    } catch (err) {
        //console.error('[GetAllTaxis] Erro ao buscar táxis:', err);
        return res.status(500).json({ message: 'Erro interno ao buscar táxis.' });
    }
};

// --- Criar Táxi ---
exports.createTaxi = async (req, res) => {
    console.log('[CreateTaxi] Dados recebidos no backend:', req.body);

    try {
        const novoTaxi = new Taxi({
            matricula: req.body.matricula,
            anoCompra: req.body.anoCompra,
            marca: req.body.marca,
            modelo: req.body.modelo,
            conforto: req.body.conforto
        });

        await novoTaxi.save();

        console.log('[CreateTaxi] Táxi criado com sucesso:', novoTaxi);
        return res.status(201).json(novoTaxi);

    } catch (err) {
        console.error('[CreateTaxi] Erro ao criar táxi:', err);

        // Validação de esquema (usamos o modelo do Mongoose para validação)
        if (err.name === 'ValidationError') {
            const mensagens = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: mensagens.join(' ') });
        }

        if (err.code === 11000) {
            console.error('[CreateTaxi] Erro de duplicação:', err.keyValue);
            const campoDuplicado = Object.keys(err.keyValue)[0].split('.')[1]; // Obtemos o campo duplicado (ex: 'pessoa.nif' -> 'nif')
            return res.status(409).json({ message: `Erro: ${campoDuplicado} já existe.` });
        }

        // Outros erros
        return res.status(500).json({ message: 'Erro interno ao criar o táxi.' });
    }
};

//Eliminar o taxi
exports.deleteTaxiById = async (req, res) => {
    try {
        const taxiId = req.params.id;

        // Verifica se existe algum turno associado a este táxi
        const turno = await Turno.findOne({ taxi: taxiId });
        if (turno) {
            return res.status(400).json({ message: 'Não é possível remover: táxi já foi requisitado para um turno.' });
        }

        const taxi = await Taxi.findByIdAndDelete(taxiId);
        if (!taxi) {
            return res.status(404).json({ message: 'Táxi não encontrado.' });
        }

        res.json({ message: 'Táxi removido com sucesso.' });
    } catch (err) {
        res.status(500).json({ message: 'Erro interno ao remover táxi.' });
    }
};

//Update do taxi
exports.updateTaxiById = async (req, res) => {
    try {
        const taxiId = req.params.id;
        const { matricula, anoCompra, marca, modelo, conforto } = req.body;

        // Verifica se o campo conforto está a ser alterado
        if (conforto !== undefined) {
            // Verifica se já existem viagens com este táxi
            const viagem = await Viagem.findOne({ taxi: taxiId });
            if (viagem) {
                return res.status(400).json({ message: 'Não é possível editar o nível de conforto: táxi já realizou viagens.' });
            }
        }

        const taxi = await Taxi.findByIdAndUpdate(
            taxiId,
            { matricula, anoCompra, marca, modelo, ...(conforto !== undefined && { conforto }) },
            { new: true }
        );

        if (!taxi) {
            return res.status(404).json({ message: 'Táxi não encontrado.' });
        }

        res.json(taxi);
    } catch (err) {
        res.status(500).json({ message: 'Erro interno ao editar táxi.' });
    }
};

exports.getTaxiById = async (req, res) => {
    try {
        const taxiId = req.params.id;
        if (!taxiId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const taxi = await Taxi.findById(taxiId);
        if (!taxi) {
            return res.status(404).json({ message: 'Táxi não encontrado.' });
        }
        res.json(taxi);
    } catch (err) {
        res.status(500).json({ message: 'Erro interno ao buscar táxi.' });
    }
};