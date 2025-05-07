const mongoose = require('mongoose');
const { turnoSchema } = require('./turno.schema');

module.exports = mongoose.model('Turno', turnoSchema);
