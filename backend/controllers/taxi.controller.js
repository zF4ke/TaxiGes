const Taxi = require('../models/taxi.model');
const { validateTaxiData } = require('../utils/validators');

// Get all taxis
exports.getAllTaxis = async (req, res) => {
    try {
        const taxis = await Taxi.find().sort({ createdAt: -1 });
        res.status(200).json(taxis);

    } catch (err) {
        console.error('Erro ao buscar táxis:', err);
        res.status(500).json({ error: 'Erro ao buscar táxis' });
    }
};

// Create a new taxi
exports.createTaxi = async (req, res) => {
    const { matricula, anoCompra, marca, modelo, conforto } = req.body;

    console.log('[CreateTaxi] Dados recebidos no backend:', { matricula, anoCompra, marca, modelo, conforto });

    const validationError = validateTaxiData({ matricula, anoCompra, marca, modelo, conforto });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        const newTaxi = new Taxi({ matricula, anoCompra, marca, modelo, conforto });
        await newTaxi.save();
        res.status(201).json(newTaxi);
    } catch (err) {
        console.error('Erro ao criar taxi:', err);
        res.status(500).json({ error: 'Erro ao criar taxi!' });
    }
};
