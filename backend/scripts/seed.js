require('dotenv').config();
const connectDB = require('../config/database');
const { addTaxiTestData } = require('../tests/taxi.test');

async function seed() {
    try {
        // Connect to database
        await connectDB();
        
        // Add test data
        await addTaxiTestData();
        
        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();