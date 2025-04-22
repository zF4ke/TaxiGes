const mongoose = require('mongoose');

// Schema para a Morada embutida
const moradaSchema = new mongoose.Schema({
  rua: {
    type: String,
    required: [true, 'A rua é obrigatória.'],
    trim: true
  },
  numeroPorta: {
    type: String,
    trim: true
  },
  codigoPostal: {
    type: String,
    required: [true, 'O código postal é obrigatório.'],
    match: [/^\d{4}-\d{3}$/, 'Formato inválido para código postal (dddd-ddd).']
  },
  localidade: {
    type: String,
    required: [true, 'A localidade é obrigatória.'],
    trim: true
  }
}, { _id: false }); 

const motoristaSchema = new mongoose.Schema({
  nif: {
    type: String,
    required: [true, 'O NIF é obrigatório.'],
    unique: true,
    match: [/^[0-9]{9}$/, 'NIF inválido. Deve conter exatamente 9 dígitos.'],
    index: true 
  },
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    trim: true
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
    min: [1900, 'Ano de nascimento inválido.'],
   
    validate: {
        validator: function(ano) {
           
            const currentYear = new Date().getFullYear();
            return (currentYear - ano) >= 18;
        },
        message: 'O motorista deve ter pelo menos 18 anos.'
    }
  },
  cartaConducao: {
    type: String,
    required: [true, 'O número da carta de condução é obrigatório.'],
    unique: true,
    trim: true,
    index: true 
  },
  morada: {
    type: moradaSchema,
    required: true
  }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente


motoristaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Motorista', motoristaSchema);

