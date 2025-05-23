const mongoose = require('mongoose');

const moradaSchema = new mongoose.Schema({
    rua: {
        type: String,
            required: [true, 'A rua é obrigatória.'],
            trim: true
        },
        numeroPorta: {
            type: String,
            trim: true
        },
    codigoPostal: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: v => /^\d{4}-\d{3}$/.test(v),
            message: props => `${props.value} não é um código postal válido (formato XXXX-XXX)`
        }
    },
    localidade: {
        type: String,
        required: [true, 'A localidade é obrigatória.'],
        trim: true
    }
});

module.exports = {
    moradaSchema
};