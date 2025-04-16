const mongoose = require('mongoose');

const TAXI_BRANDS = ['Toyota', 'Ford', 'Mercedes', 'Volkswagen'];
const TAXI_MODELS = {
  Toyota: ['Corolla', 'Prius', 'Camry'],
  Ford: ['Focus', 'Fiesta', 'Mondeo'],
  Mercedes: ['C-Class', 'E-Class', 'S-Class'],
  Volkswagen: ['Golf', 'Passat', 'Polo'],
};

const taxiSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: value => /^[A-Z0-9\-]+$/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value),
            message: 'Matrícula inválida. Deve conter letras e dígitos, e pode incluir hífens.'
        }
    },
    anoCompra: {
        type: Number,
        required: true,
        validate: {
            validator: value => value <= new Date().getFullYear(),
            message: 'O ano de compra não pode ser no futuro.'
        }
    },
    marca: {
        type: String,
        required: true,
        enum: {
            values: TAXI_BRANDS,
            message: 'Marca inválida. As marcas permitidas são: ' + TAXI_BRANDS.join(', ') + '.'
        }
    },
    modelo: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // se a marca existir, validar modelo associado
                if (!this.brand || !TAXI_MODELS[this.brand]) return true;
                return TAXI_MODELS[this.brand].includes(v);
            },
            message: 'Modelo inválido para a marca especificada.'
        }
    },
    conforto: {
        type: String,
        required: true,
        enum: ['básico', 'luxuoso'],
        lowercase: true
    }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

taxiSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Taxi', taxiSchema);
