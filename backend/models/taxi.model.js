const mongoose = require('mongoose');
const { taxiSchema } = require('./taxi.schema');

module.exports = mongoose.model('Taxi', taxiSchema);
