const mongoose = require('mongoose');
const { clienteSchema } = require('./cliente.schema');

module.exports = mongoose.model('Cliente', clienteSchema);
