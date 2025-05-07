const app = require('./app');
const connectDB = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

if (!process.argv.some(arg => arg.includes('jest'))) {
    connectDB();
    
    app.listen(PORT, () => {
        console.log(`O servidor está a rodar na porta ${PORT}`);
    });
}
