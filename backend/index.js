const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const taxiRoutes = require('./routes/taxi.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/taxis', taxiRoutes);

app.get('/', (req, res) => {
    res.send('TaxiGes API is running!');
});

app.listen(PORT, () => {
    console.log(`O servidor está a rodar na porta ${PORT}`);
});