const mongoose = require('mongoose');

const pessoaSimplesSchema = new mongoose.Schema({
  nif: {
    type: String,
    required: [true, 'O NIF é obrigatório.'],
    match: [/^\d{9}$/, 'NIF inválido. Deve conter exatamente 9 dígitos.'],
    trim: true
  },
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    trim: true,
    validate: {
      validator: v => v.trim().length > 0,
      message: 'O nome não pode estar vazio.'
    }
  },
  genero: {
    type: String,
    required: [true, 'O género é obrigatório.'],
    enum: {
      values: ['feminino', 'masculino'],
      message: 'Género inválido. Use "feminino" ou "masculino".'
    }
  },
  anoNascimento: {
    type: Number,
    required: [true, 'O ano de nascimento é obrigatório.'],
    min: [0, 'Ano de nascimento inválido.'],
    max: [new Date().getFullYear(), 'Ano de nascimento não pode estar no futuro.']
  }
}, { _id: false });

module.exports = { pessoaSimplesSchema };
