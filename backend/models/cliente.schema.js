const mongoose = require('mongoose');
const { pessoaSchema } = require('./pessoa.schema');

const clienteSchema = new mongoose.Schema({
    pessoa: {
        type: pessoaSchema,
        required: true
    }
}, { timestamps: true });

clienteSchema.index({ createdAt: -1 });

module.exports = {
    clienteSchema
};
