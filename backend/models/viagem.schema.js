const mongoose = require('mongoose');
const { clienteSchema } = require('./cliente.schema');
const { moradaSchema } = require('./morada.schema');
const { turnoSchema } = require('./turno.schema');

const viagemSchema = new mongoose.Schema({
    numeroSequencia: {
        type: Number,
        required:true
        // Verificar depois se E melhor fazer aqui o calculo do numero de seq
        // ou quando estamos a criar a viagem
    },
    cliente: {
        type: clienteSchema,
        required: true
    },
    turno: {
        type: turnoSchema,
        required: true
    },
    inicio: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value < this.fim;
            },
            message: 'O início da viagem deve ser anterior ao fim.'
        }
    },
    fim: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.inicio;
            },
            message: 'O fim da viagem deve ser posterior ao início.'
        }
    },
    localInicio: {
        type: moradaSchema,
        required: true
    },
    localFim: {
        type: moradaSchema,
        required: true
    },
    numeroPessoas: {
        type: Number,
        required: true,
        min: [1, 'O número de pessoas deve ser pelo menos 1.']
    },
    quilometrosPercorridos: {
        type: Number,
        required: true,
        min: [0, 'Os quilómetros percorridos devem ser positivos.']
    },
    preco: {
        type: Number,
        required: true,
        min: [0, 'O preço deve ser positivo.']
    }
}, { timestamps: true });

viagemSchema.index({ createdAt: -1 });

module.exports = {
    viagemSchema
};
