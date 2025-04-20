const mongoose = require('mongoose');

const precoSchema = new mongoose.Schema({
  precoPorMinuto: {
    type: Number,
    required: true,
    min: [0.01, 'O preço por minuto deve ser maior que 0.01']
  },
  tipo: {
    type: String,
    enum: ['básico', 'luxuoso'],
    required: true,
    unique: true
  },
  agravamento: {
    type: Number,
    required: true,
    min: [0, 'O agravamento não pode ser negativo']
  }
});

module.exports = mongoose.model('Preco', precoSchema);