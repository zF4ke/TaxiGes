const mongoose = require('mongoose');
const { pedidoSchema } = require('./pedido.schema');

module.exports = mongoose.model('Pedido', pedidoSchema);
