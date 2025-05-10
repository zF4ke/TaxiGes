const mongoose = require('mongoose');
const { pessoaSimplesSchema } = require('./pessoaSimples.schema');

const clienteSchema = new mongoose.Schema({
    pessoa: {
        type: pessoaSimplesSchema,
        required: true
    }
}, { timestamps: true });

clienteSchema.index({ createdAt: -1 });

module.exports = {
    clienteSchema
};
