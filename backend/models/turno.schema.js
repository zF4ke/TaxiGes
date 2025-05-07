const mongoose = require('mongoose');
const { motoristaSchema } = require('./motorista.schema');
const { taxiSchema } = require('./taxi.schema');

const turnoSchema = new mongoose.Schema({
    motorista: {
        type: motoristaSchema,
        required: true,
    },
    taxi: {
        type: taxiSchema,
        required: true,
    }, 
    inicio: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value < this.fim;
            },
            message: 'O inicio do turno deve ser anterior ao fim do turno.'
        }
    },
    fim: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.inicio;
            },
            message: 'O fim do turno deve ser posterior ao inicio do turno.'
        }
    }
}, { timestamps: true });

// Indexes to prevent overlapping shifts for the same motorista or taxi
turnoSchema.index({ motorista: 1, inicio: 1, fim: 1 }, { unique: true });
turnoSchema.index({ taxi: 1, inicio: 1, fim: 1 }, { unique: true });
turnoSchema.index({ createdAt: -1 });

module.exports = {
    turnoSchema
};
