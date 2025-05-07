const mongoose = require('mongoose');
const { TAXI_BRANDS, TAXI_MODELS } = require('../utils/constants');

const taxiSchema = new mongoose.Schema({
    matricula: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(matricula) {
                const plateRegex = /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/;
                if (!plateRegex.test(matricula)) {
                    return false; 
                }

                const [part1, part2, part3] = matricula.split('-');
                const isAllNumbers = (str) => /^[0-9]{2}$/.test(str);
                const isAllLetters = (str) => /^[A-Z]{2}$/.test(str);
                const hasMixedCharacters = (str) => !isAllNumbers(str) && !isAllLetters(str);
                
                // Check if any pair has mixed characters
                if (hasMixedCharacters(part1) || hasMixedCharacters(part2) || hasMixedCharacters(part3)) {
                    return false;
                }

                // Allow only the specified formats
                if (
                    (isAllLetters(part1) && isAllNumbers(part2) && isAllLetters(part3)) || // XX-00-XX
                    (isAllNumbers(part1) && isAllLetters(part2) && isAllNumbers(part3)) || // 00-XX-00
                    (isAllNumbers(part1) && isAllNumbers(part2) && isAllLetters(part3)) || // 00-00-XX
                    (isAllLetters(part1) && isAllNumbers(part2) && isAllNumbers(part3))    // XX-00-00
                ) {
                    return true;
                }

                return false;
            },
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
                const marca = this.marca;
                if (!marca || !TAXI_MODELS[marca]) return false;
                return TAXI_MODELS[marca].includes(v);
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

module.exports = {
    taxiSchema
};