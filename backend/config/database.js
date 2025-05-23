require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI não está definido no arquivo .env');
    process.exit(1);
}

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

const connectDB = async () => {
    try {
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("MongoDB conectado com sucesso!");
    } catch (err) {
        console.error("Erro ao conectar ao MongoDB:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;