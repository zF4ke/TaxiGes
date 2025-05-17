const mongoose = require('mongoose');
const { moradaSchema } = require('./morada.schema');
const { TAXI_COMFORT, PEDIDO_STATUS } = require('../utils/constants');

const pedidoSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
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
    distanciaKm: {
        type: Number,
    },
    motoristaCoords: {
        lat: {
            type: Number,
        },
        lon: {
            type: Number,
        }
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Motorista'
    },
    motoristasRejeitados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Motorista'
    }],
    clienteAceitouMotorista: {
        type: Boolean,
        default: false,
        required: true
    },
}, { timestamps: true });

pedidoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Pedido', pedidoSchema);
