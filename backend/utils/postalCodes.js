const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Cache para armazenar os dados do CSV em memória
let postalCodesCache = null;

// Função para carregar dados do CSV
const loadPostalCodesData = () => {
    return new Promise((resolve, reject) => {
        if (postalCodesCache) {
            return resolve(postalCodesCache);
        }

        const results = {};
        fs.createReadStream(path.join(__dirname, '../data/codigos_postais.csv'))
            .pipe(csv())
            .on('data', (data) => {
                const postalCode = `${data.num_cod_postal}-${data.ext_cod_postal}`;
                results[postalCode] = data.desig_postal;
            })
            .on('end', () => {
                postalCodesCache = results;
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Função para obter a localidade por código postal
const getLocalityByPostalCode = async (postalCode) => {
    const postalCodes = await loadPostalCodesData();
    return postalCodes[postalCode] || null;
};

module.exports = {
    getLocalityByPostalCode
};