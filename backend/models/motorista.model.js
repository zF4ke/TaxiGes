const mongoose = require('mongoose');
const { pessoaSchema } = require('./pessoa.schema');

const motoristaSchema = new mongoose.Schema({
    pessoa: {
        type: pessoaSchema,
        required: true,
        validate: {
            validator: function(p) {
                const atual = new Date().getFullYear();
                return p.anoNascimento && (atual - p.anoNascimento >= 18);
            },
            message: 'O motorista deve ter pelo menos 18 anos.'
        }
    },
    cartaConducao: {
        type: String,
        required: [true, 'O número da carta de condução é obrigatório.'],
        unique: true,
        trim: true,
        index: true
    }
}, { timestamps: true });

// Ensure NIF is unique and non-null
motoristaSchema.index({ 'pessoa.nif': 1 }, { unique: true, sparse: true });
motoristaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Motorista', motoristaSchema);
