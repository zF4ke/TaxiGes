const Motorista = require('../models/motorista.model');
const { getLocalityByPostalCode: findLocalityByPostalCode } = require('../utils/postalCodes');

// --- Criar Motorista ---
exports.createMotorista = async (req, res) => {

    try {
        const novoMotorista = new Motorista(req.body);
        await novoMotorista.save();

        return res.status(201).json(novoMotorista);

    } catch (err) {
        // Validação de esquema (usamos o modelo do Mongoose para validação)
        if (err.name === 'ValidationError') {
            const mensagens = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: mensagens.join(' ') });
        }

        // Duplicação (NIF ou cartaConducao)
        if (err.code === 11000) {
            const campoDuplicado = Object.keys(err.keyValue)[0];
            const nomeCampo = campoDuplicado === 'pessoa.nif' ? 'NIF' : 'Carta de Condução';
            return res.status(409).json({ message: `Erro: ${nomeCampo} já existe.` });
        }

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

exports.listarParaSelecao = async (req, res) => {
    try {
        // Busca os campos _id e o subdocumento pessoa (que contém nome e NIF)
        const motoristas = await Motorista.find({}, '_id pessoa.nome pessoa.NIF').sort({ 'pessoa.nome': 1 });

        const resultadoFormatado = motoristas.map(m => ({
            _id: m._id,
            nome: m.pessoa.nome,
            NIF: m.pessoa.NIF  
        }));
        res.status(200).json(resultadoFormatado); 

    } catch (error) {
        console.error("Erro ao listar motoristas para seleção:", error);
        res.status(500).json({ message: 'Erro ao buscar motoristas para seleção.', error: error.message });
    }
};



exports.acessoPorNIF = async (req, res) => {
    const { nif } = req.body;

    if (!nif || !/^\d{9}$/.test(nif) || parseInt(nif, 10) <= 0) {
        return res.status(400).json({ message: "NIF inválido. Deve ter 9 dígitos e ser um número positivo." });
    }
    try {
        const motorista = await Motorista.findOne(
            { 'pessoa.NIF': nif },
            '_id pessoa.nome pessoa.NIF'
        );
        if (!motorista) {
            return res.status(404).json({ message: "Motorista não encontrado com o NIF fornecido." });
        }
        const resultadoFormatado = {
            _id: motorista._id,
            nome: motorista.pessoa.nome, 
            NIF: motorista.pessoa.NIF 
        };
        res.status(200).json(resultadoFormatado); 
    } catch (error) {
        console.error("Erro no acesso do motorista por NIF:", error);
        res.status(500).json({ message: 'Erro ao processar o acesso do motorista.', error: error.message });
    }
};
