const mongoose = require('mongoose');
const { clienteSchema } = require('./cliente.schema');
const { moradaSchema } = require('./morada.schema');
const { TAXI_COMFORT, PEDIDO_STATUS } = require('../utils/constants');

const pedidoSchema = new mongoose.Schema({
    cliente: {
        type: clienteSchema,
        required: true
    },
    localizacaoAtual: {
        type: moradaSchema,
        required: true
    },
    destino: {
        type: moradaSchema,
        required: true
    },
    nivelConforto: {
        type: String,
        required: true,
        enum: TAXI_COMFORT,
        message: 'Nível de confordo invalido.'
    },
    numeroPessoas: {
        type: Number,
        required: true,
        min: [1, 'O número de pessoas deve ser pelo menos 1.']
    },
    status: {
        type: String,
        enum: PEDIDO_STATUS,
        default: 'pendente'
    },
    motoristaSelecionado: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Motorista' },
        pessoa: { 
            type: Object 
        }
    }
}, { timestamps: true });

pedidoSchema.index({ createdAt: -1 });

module.exports = {
    pedidoSchema
};