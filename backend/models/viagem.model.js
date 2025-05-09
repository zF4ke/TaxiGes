const mongoose = require('mongoose');
const { viagemSchema } = require('./viagem.schema');

module.exports = mongoose.model('Viagem', viagemSchema);
