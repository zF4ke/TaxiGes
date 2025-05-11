const Taxi = require('../models/taxi.model');

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
