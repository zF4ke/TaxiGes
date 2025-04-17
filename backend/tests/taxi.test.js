const Taxi = require('../models/taxi.model');

const mockTaxiData = [
    {
        matricula: "AA-12-BB",
        anoCompra: 2023,
        marca: "Toyota",
        modelo: "Prius",
        conforto: "básico"
    },
    {
        matricula: "CC-34-DD",
        anoCompra: 2024,
        marca: "Mercedes-Benz",
        modelo: "E-Class",
        conforto: "luxuoso"
    },
    {
        matricula: "EE-56-FF",
        anoCompra: 2022,
        marca: "Volkswagen",
        modelo: "Passat",
        conforto: "básico"
    },
    {
        matricula: "GG-78-HH",
        anoCompra: 2023,
        marca: "Ford",
        modelo: "Focus",
        conforto: "básico"
    }
];

async function addTaxiTestData() {
    try {
        // Clear existing data
        await Taxi.deleteMany({});
        
        // Insert mock data
        const insertedTaxis = await Taxi.insertMany(mockTaxiData);
        console.log('Dados de teste inseridos com sucesso:', insertedTaxis);

        return insertedTaxis;
    } catch (error) {
        console.error('Erro ao inserir dados de teste:', error);
        throw error;
    }
}

// Export for use in other files
module.exports = {
    addTaxiTestData,
    mockTaxiData
};