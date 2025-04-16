const Taxi = require('../models/taxi.model');

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