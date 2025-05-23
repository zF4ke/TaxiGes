const mongoose = require('mongoose');

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
                const Turno = mongoose.models.Turno;
                const turno = await Turno.findById(value);
                if (!turno) return false;
                if (!this.inicio || !this.fim) return true; // Se não houver datas, não valida

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
                if (!value) return true;
                if (!this.fim) return true;

                return value <= this.fim;
            },
            message: 'O início da viagem deve ser anterior ao fim.'
        }
    },
    fim: {
        type: Date,
        required: false,
        validate: {
            validator: function (value) {
                if (!value) return true;
                return value >= this.inicio;
            },
            message: 'O fim da viagem deve ser posterior ao início.'
        }
    },
    localInicio: {
        type: String,
        required: true
    },
    localFim: {
        type: String,
        required: false
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
        enum: ['ativa', 'concluida', 'cancelada', 'agendada'],
        default: 'ativa',
    },
}, { timestamps: true });

viagemSchema.index({ createdAt: -1 });


module.exports = mongoose.model('Viagem', viagemSchema);
