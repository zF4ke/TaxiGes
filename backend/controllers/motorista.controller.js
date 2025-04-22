const Motorista = require('../models/motorista.model');
const { validateMotoristaData } = require('../utils/motoristaValidators');

// --- Criar Motorista ---
exports.createMotorista = async (req, res) => {
    console.log('[CreateMotorista] Dados recebidos no backend:', req.body);

    // Validação assíncrona 
    const validationResult = await validateMotoristaData(req.body);
    if (!validationResult.isValid) {
        console.error('Erro de validação:', validationResult.errors);
        const firstErrorKey = Object.keys(validationResult.errors)[0];
        return res.status(400).json({
             message: validationResult.errors[firstErrorKey] || validationResult.message
        });
    }

    try {
        const novoMotorista = new Motorista({
            nif: req.body.nif,
            nome: req.body.nome,
            genero: req.body.genero,
            anoNascimento: Number(req.body.anoNascimento), // Garante que é número
            cartaConducao: req.body.cartaConducao,
            morada: {
                rua: req.body.morada.rua,
                numeroPorta: req.body.morada.numeroPorta,
                codigoPostal: req.body.morada.codigoPostal,
                localidade: req.body.morada.localidade
            }
        });

        await novoMotorista.save(); 

        console.log('[CreateMotorista] Motorista criado:', novoMotorista);
        res.status(201).json(novoMotorista);

    } catch (err) {
        console.error('Erro ao criar motorista:', err);
        // Verifica se é erro de validação do Mongoose ou outro erro
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(' ') });
        }
        if (err.code === 11000) {
             let field = Object.keys(err.keyValue)[0];
             field = field === 'nif' ? 'NIF' : 'Carta de Condução'; // Torna mais legível
             return res.status(409).json({ message: `Erro: ${field} já existe.` });
        }
        res.status(500).json({ message: 'Ocorreu um erro interno ao criar o motorista.' });
    }
};

// --- Listar todos os Motoristas ---
exports.getAllMotoristas = async (req, res) => {
    try {
        const motoristas = await Motorista.find().sort({ createdAt: -1 }); // Ordenado por data de criação
        res.status(200).json(motoristas);
    } catch (err) {
        console.error('Erro ao buscar motoristas:', err);
        res.status(500).json({ message: 'Erro interno ao buscar motoristas' });
    }
};


exports.getLocalityByPostalCode = async (req, res) => {
    const cp = req.params.cp;
    console.log(`[GetLocality] Procurando localidade para CP: ${cp}`);

    // Validação simples do formato
    if (!/^\d{4}-\d{3}$/.test(cp)) {
        return res.status(400).json({ message: 'Formato de código postal inválido (dddd-ddd).' });
    }

    
    let localidadeEncontrada = null;
    if (cp === '1600-001') {
        localidadeEncontrada = 'Lisboa (Lumiar)';
    } else if (cp === '1749-016') {
        localidadeEncontrada = 'Lisboa (Campo Grande)';
    }

    if (localidadeEncontrada) {
        res.status(200).json({ localidade: localidadeEncontrada });
    } else {
        res.status(404).json({ message: 'Localidade não encontrada para este código postal.' });

    }
};