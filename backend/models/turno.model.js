const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
    motorista: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Motorista',
        required: true,
    },
    taxi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Taxi',
        required: true,
    },
    inicio: {
        type: Date,
        required: true,
        validate: [
            {
                validator: function (value) {
                    // RIA 5: início anterior ao fim
                    return value < this.fim;
                },
                message: 'O início do turno deve ser anterior ao fim do turno.'
            },
            // {
            //     validator: function(value) {
            //         // Não pode começar no passado
            //         return value > new Date();
            //     },
            //     message: 'O início do turno deve ser posterior ao momento atual.'
            // }
        ]
    },
    fim: {
        type: Date,
        required: true,
        validate: [
            {
                validator: function (value) {
                    // RIA 5: fim posterior ao início
                    return value > this.inicio;
                },
                message: 'O fim do turno deve ser posterior ao início do turno.'
            }
        ]
    }
}, { timestamps: true });

// RIA: duração máxima de 8 horas
turnoSchema.path('fim').validate(function(value) {
    if (!this.inicio || !value) return true;
    const durationMs = value - this.inicio;
    return durationMs <= 8 * 60 * 60 * 1000;
}, 'A duração do turno não pode ser superior a 8 horas.');

// RIA 8: evitar sobreposição de turnos do mesmo motorista ou táxi
turnoSchema.pre('validate', async function(next) {
    try {
        const Turno = mongoose.models.Turno || mongoose.model('Turno', turnoSchema);
        const overlap = await Turno.findOne({
            _id: { $ne: this._id },
            $or: [
                {
                    'motorista._id': this.motorista._id,
                    inicio: { $lt: this.fim },
                    fim: { $gt: this.inicio }
                },
                {
                    'taxi._id': this.taxi._id,
                    inicio: { $lt: this.fim },
                    fim: { $gt: this.inicio }
                }
            ]
        });
        if (overlap) {
            return next(new Error('Turno interseta com um turno existente para o mesmo motorista ou táxi.'));
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Índice para ordenar por data de criação (mais recente primeiro)
turnoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Turno', turnoSchema);
