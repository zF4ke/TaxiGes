const express = require('express');
const cors = require('cors');
const taxiRoutes = require('./routes/taxi.routes');
const precoRoutes = require('./routes/preco.routes');
const motoristaRoutes = require('./routes/motorista.routes');
const turnoRoutes = require('./routes/turno.routes');
const pedidoRoutes = require('./routes/pedido.routes');
const viagemRoutes = require('./routes/viagem.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/taxis', taxiRoutes);
app.use('/api/precos', precoRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/viagens', viagemRoutes);

app.get('/', (req, res) => {
    res.send('TaxiGes API is running!');
});

module.exports = app;
