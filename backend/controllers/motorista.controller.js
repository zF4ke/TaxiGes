const Motorista = require('../models/motorista.model');
const { getLocalityByPostalCode: findLocalityByPostalCode } = require('../utils/postalCodes');

// --- Criar Motorista ---
exports.createMotorista = async (req, res) => {
    //console.log('[CreateMotorista] Dados recebidos no backend:', req.body);

    try {
        const novoMotorista = new Motorista(req.body);
        await novoMotorista.save();

        //console.log('[CreateMotorista] Motorista criado com sucesso:', novoMotorista);
        return res.status(201).json(novoMotorista);

    } catch (err) {
        //console.error('Erro ao criar motorista:', err);

        // Validação de esquema (usamos o modelo do Mongoose para validação)
        if (err.name === 'ValidationError') {
            const mensagens = Object.values(err.errors).map(e => e.message);
            //console.error('Erros de validação:', mensagens);
            return res.status(400).json({ message: mensagens.join(' ') });
        }

        // Duplicação (NIF ou cartaConducao)
        if (err.code === 11000) {
            const campoDuplicado = Object.keys(err.keyValue)[0];
            //console.log('Campo duplicado:', campoDuplicado);
            const nomeCampo = campoDuplicado === 'pessoa.nif' ? 'NIF' : 'Carta de Condução';
            return res.status(409).json({ message: `Erro: ${nomeCampo} já existe.` });
        }

        // Outros erros
        return res.status(500).json({ message: 'Erro interno ao criar o motorista.' });
    }
};

// --- Listar Motoristas ---
exports.getAllMotoristas = async (req, res) => {
    try {
        const motoristas = await Motorista.find().sort({ createdAt: -1 });
        return res.status(200).json(motoristas);
    } catch (err) {
        //console.error('Erro ao buscar motoristas:', err);
        return res.status(500).json({ message: 'Erro interno ao buscar motoristas.' });
    }
};

// --- Obter localidade por código postal ---
exports.getLocalityByPostalCode = async (req, res) => {
    const cp = req.params.cp;
    //console.log(`[GetLocality] Código postal recebido: ${cp}`);

    if (!/^\d{4}-\d{3}$/.test(cp)) {
        return res.status(400).json({ message: 'Formato de código postal inválido (dddd-ddd).' });
    }

    try {
        const localidade = await findLocalityByPostalCode(cp);
        if (localidade) {
            return res.status(200).json({ localidade });
        }
        return res.status(404).json({ message: 'Localidade não encontrada para este código postal.' });
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao processar o código postal.' });
    }
};
