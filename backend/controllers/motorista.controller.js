const Motorista = require('../models/motorista.model');
const Turno = require('../models/turno.model');
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
            const nomeCampo = campoDuplicado === 'nif' ? 'NIF' : 'Carta de Condução';
            return res.status(409).json({ message: `Erro: ${nomeCampo} já existe.` });
        }

        return res.status(500).json({ message: 'Erro interno ao criar o motorista.' });
    }
};

// --- Listar Motoristas ---
exports.getAllMotoristas = async (req, res) => {
    try {
        const motoristas = await Motorista.find().sort({ updatedAt: -1 });
        return res.status(200).json(motoristas);
    } catch (err) {
        console.error('Erro ao buscar motoristas:', err); 
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
        
        const motoristas = await Motorista.find({}, '_id nome nif').sort({ 'nome': 1 });

        const resultadoFormatado = motoristas.map(m => ({
            _id: m._id,
            nome: m.nome,
            nif: m.nif 
        }));
        
        res.status(200).json(resultadoFormatado);

    } catch (error) {
        console.error("Erro ao listar motoristas para seleção:", error);
        res.status(500).json({ message: 'Erro ao buscar motoristas para seleção.', error: error.message });
    }
};



exports.acessoPorNIF = async (req, res) => {
    const { nif } = req.body; 
    console.log(`---acessoPorNIF--- Recebido NIF: ${nif}`); 

    if (!nif || !/^\d{9}$/.test(nif) || parseInt(nif, 10) <= 0) {
        return res.status(400).json({ message: "NIF inválido. Deve ter 9 dígitos e ser um número positivo." });
    }

    try {
        const motorista = await Motorista.findOne(
            { 'nif': nif }, 
            '_id nome nif'
        );

        if (!motorista) {
            return res.status(404).json({ message: "Motorista não encontrado com o NIF fornecido." });
        }

        const resultadoFormatado = {
            _id: motorista._id,
            nome: motorista.nome,
            nif: motorista.nif 
        };
        res.status(200).json(resultadoFormatado);
    } catch (error) {
        console.error("Erro no acesso do motorista por NIF:", error);
        res.status(500).json({ message: 'Erro ao processar o acesso do motorista.', error: error.message });
    }
};


exports.deleteMotorista = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificar se o motorista existe
        const motorista = await Motorista.findById(id);
        if (!motorista) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }

        // 2. Verificar se o motorista tem turnos associados
        // Assumindo que no seu turno.model.js, tem um campo como 'motoristaId' ou 'motorista' que referencia o _id do motorista
        const turnosAssociados = await Turno.findOne({ motorista: id }); // Ou o nome do campo correto: ex: { motoristaId: id }

        if (turnosAssociados) {
            return res.status(403).json({ message: 'Este motorista não pode ser removido pois possui turnos associados.' });
        }

        // 3. Se não houver turnos, remover o motorista
        await Motorista.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Motorista removido com sucesso.' });

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID do motorista inválido.' });
        }
        console.error('Erro ao remover motorista:', error);
        return res.status(500).json({ message: 'Erro interno ao remover o motorista.' });
    }
};

// --- Obter Motorista por ID ---
exports.getMotoristaById = async (req, res) => {
    try {
        const motorista = await Motorista.findById(req.params.id);
        if (!motorista) {
            return res.status(404).json({ message: 'Motorista não encontrado.' });
        }
        return res.status(200).json(motorista);
    } catch (error) {
        if (error.kind === 'ObjectId') { // Verifica se o ID tem um formato inválido
            return res.status(400).json({ message: 'ID do motorista inválido.' });
        }
        console.error('Erro ao buscar motorista por ID:', error);
        return res.status(500).json({ message: 'Erro interno ao buscar o motorista.' });
    }
};

// --- Atualizar Motorista --- 
exports.updateMotorista = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // 1. Verificar se o motorista existe
        const motoristaExistente = await Motorista.findById(id);
        if (!motoristaExistente) {
            return res.status(404).json({ message: 'Motorista não encontrado para atualização.' });
        }

        // 2. Validações de unicidade para NIF e Carta de Condução se forem alterados
        if (updateData.nif && updateData.nif !== motoristaExistente.nif) {
            const duplicadoNif = await Motorista.findOne({ nif: updateData.nif, _id: { $ne: id } });
            if (duplicadoNif) {
                return res.status(409).json({ message: 'Erro: O NIF fornecido já está associado a outro motorista.' });
            }
        }
        if (updateData.cartaConducao && updateData.cartaConducao !== motoristaExistente.cartaConducao) {
            const duplicadoCarta = await Motorista.findOne({ cartaConducao: updateData.cartaConducao, _id: { $ne: id } });
            if (duplicadoCarta) {
                return res.status(409).json({ message: 'Erro: O número da Carta de Condução fornecido já está associado a outro motorista.' });
            }
        }
        
        // 3. Atualizar o motorista
        const motoristaAtualizado = await Motorista.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!motoristaAtualizado) { // Segurança adicional
             return res.status(404).json({ message: 'Motorista não encontrado após tentativa de atualização.' });
        }
        return res.status(200).json(motoristaAtualizado);

    } catch (err) {
        if (err.name === 'ValidationError') {
            const mensagens = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: mensagens.join('; ') });
        }
        if (err.code === 11000) { 
             const campoDuplicado = Object.keys(err.keyValue)[0];
             let nomeCampoUserFriendly = campoDuplicado;
             if (campoDuplicado === 'nif') nomeCampoUserFriendly = 'NIF';
             if (campoDuplicado === 'cartaConducao') nomeCampoUserFriendly = 'Carta de Condução';
             return res.status(409).json({ message: `Erro: ${nomeCampoUserFriendly} já existe.` });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID do motorista fornecido é inválido.' });
        }
        console.error('Erro ao atualizar motorista:', err);
        return res.status(500).json({ message: 'Erro interno ao atualizar o motorista.' });
    }
};