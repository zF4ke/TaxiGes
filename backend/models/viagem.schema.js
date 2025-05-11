const mongoose = require('mongoose');
const { clienteSchema } = require('./cliente.schema');
const { moradaSchema } = require('./morada.schema');
const { turnoSchema } = require('./turno.schema');

const viagemSchema = new mongoose.Schema({
    numeroSequencia: {
        type: Number,
        required:true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    pedido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedido',
        required: true
    },
    turno: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Turno',
        required: true,
        validate: {
            validator: async function (value) {
                const Turno = mongoose.models.Turno || mongoose.model('Turno', turnoSchema);
                const turno = await Turno.findById(value);
                if (!turno) return false;
                return this.inicio >= turno.inicio && this.fim <= turno.fim;
            },
            message: 'A viagem deve estar dentro do intervalo do turno.'
        }
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
    },
    status: {
        type: String,
        enum: ['por iniciar', 'iniciada', 'finalizada'],
        default: 'por iniciar'
    },
}, { timestamps: true });

viagemSchema.index({ createdAt: -1 });

module.exports = {
    viagemSchema
};
