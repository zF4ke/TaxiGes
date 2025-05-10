const mongoose = require('mongoose');

const pessoaSimplesSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório.'],
        trim: true
    },
    nif: {
        type: String,
        required: [true, 'O NIF é obrigatório.'],
        unique: false, // Pode ser true se quiseres garantir NIF único
        trim: true,
        match: [/^\d{9}$/, 'NIF inválido. Deve conter exatamente 9 dígitos.'],
        validate: {
            validator: function(v) {
                return v !== null && v !== undefined && v.length === 9;
            },
            message: 'NIF inválido ou não fornecido.'
        }
    },
    genero: {
        type: String,
        required: [true, 'O género é obrigatório.'],
        trim: true,
        enum: {
            values: ['feminino', 'masculino'],
            message: 'Género inválido. Use "feminino" ou "masculino".'
        }
    },
    anoNascimento: {
        type: Number,
        required: [true, 'O ano de nascimento é obrigatório.'],
        validate: {
            validator: value => value <= new Date().getFullYear(),
            message: 'O ano de nascimento não pode ser no futuro.'
        }
    }
});

module.exports = {
    pessoaSimplesSchema
};