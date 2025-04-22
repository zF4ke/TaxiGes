const Motorista = require('../models/motorista.model'); // Para verificar unicidade

async function validateMotoristaData(data) {
    const { nif, nome, genero, anoNascimento, cartaConducao, morada } = data;
    const errors = {};

    // Validações básicas de presença 
    if (!nif) errors.nif = 'NIF é obrigatório.';
    if (!nome) errors.nome = 'Nome é obrigatório.';

    // Validação de NIF (formato + unicidade)
    if (nif && !/^[0-9]{9}$/.test(nif)) {
        errors.nif = 'NIF inválido. Deve conter exatamente 9 dígitos.';
    } else if (nif) {
        const existingNif = await Motorista.findOne({ nif });
        if (existingNif) {
            errors.nif = 'Este NIF já está registado.';
        }
    }

    // Validação de Género
    if (genero && !['feminino', 'masculino'].includes(genero)) {
        errors.genero = 'Género inválido. Use "feminino" ou "masculino".';
    }

    // Validação Ano Nascimento (idade mínima)
    if (anoNascimento) {
       const currentYear = new Date().getFullYear();
       if ((currentYear - Number(anoNascimento)) < 18) {
           errors.anoNascimento = 'O motorista deve ter pelo menos 18 anos.';
       }
       if (Number(anoNascimento) < 1900) {
           errors.anoNascimento = 'Ano de nascimento inválido.';
       }
    }

    // Validação Carta de Condução (presença + unicidade)
    if (!cartaConducao) {
        errors.cartaConducao = 'Número da carta de condução é obrigatório.';
    } else {
        const existingCarta = await Motorista.findOne({ cartaConducao });
        if (existingCarta) {
            errors.cartaConducao = 'Este número de carta de condução já está registado.';
        }
    }

    // Validação da Morada
    if (!morada) {
        errors.morada = 'A morada é obrigatória.';
    } else {
        if (!morada.rua) errors.morada_rua = 'A rua é obrigatória.';
        if (!morada.codigoPostal) {
            errors.morada_codigoPostal = 'O código postal é obrigatório.';
        } else if (!/^\d{4}-\d{3}$/.test(morada.codigoPostal)) {
            errors.morada_codigoPostal = 'Formato inválido para código postal (dddd-ddd).';
        }
        if (!morada.localidade) errors.morada_localidade = 'A localidade é obrigatória.';
    }


    if (Object.keys(errors).length > 0) {
        return {
            isValid: false,
            errors: errors,
            message: 'Existem erros nos dados do motorista.'
        };
    }

    return { isValid: true };
}

module.exports = {
    validateMotoristaData
};