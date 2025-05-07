const mongoose = require('mongoose');
const { motoristaSchema } = require('./motorista.schema');

module.exports = mongoose.model('Motorista', motoristaSchema);
