const { TAXI_BRANDS, TAXI_MODELS, TAXI_COMFORT } = require('./constants');

function validateRequiredFields({ matricula, anoCompra, marca, modelo, conforto }) {
    if (!matricula || !anoCompra || !marca || !modelo || !conforto) {
        return 'Todos os campos sao obrigatorios!';
    }
    return null;
}

function validatePlate(matricula) {
    if (!/^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/.test(matricula)) {
        return 'Matricula invalida. Use o formato XX-XX-XX.';
    }

    const [part1, part2, part3] = matricula.split('-');
    const isAllNumbers = (str) => /^[0-9]{2}$/.test(str);
    const isAllLetters = (str) => /^[A-Z]{2}$/.test(str);
    const hasMixedCharacters = (str) => !isAllNumbers(str) && !isAllLetters(str);

    // Check if any pair has mixed characters
    if (hasMixedCharacters(part1) || hasMixedCharacters(part2) || hasMixedCharacters(part3)) {
      return { patternError: true };
    }

    if (
        (isAllNumbers(part1) && isAllNumbers(part2) && isAllNumbers(part3)) ||
        (isAllLetters(part1) && isAllLetters(part2) && isAllLetters(part3))
    ) {
        return 'Matricula invalida. Os pares nao podem ser todos numeros ou todas letras.';
    }

    return null;
}

function validateYear(anoCompra) {
    const currentYear = new Date().getFullYear();
    if (anoCompra > currentYear) {
        return 'Ano de compra invalido. O ano deve ser anterior ou igual ao ano atual.';
    }
    return null;
}

function validateBrand(marca) {
    if (!TAXI_BRANDS.includes(marca)) {
        return 'Marca invalida. Escolha uma das marcas permitidas.';
    }
    return null;
}

function validateModel(marca, modelo) {
    if (!TAXI_MODELS[marca] || !TAXI_MODELS[marca].includes(modelo)) {
        return 'Modelo invalido. Escolha um modelo valido para a marca selecionada.';
    }
    return null;
}

function validateComfort(conforto) {
    if (!TAXI_COMFORT.includes(conforto)) {
        return 'Nivel de conforto invalido. Use "básico" ou "luxuoso".';
    }
    return null;
}

function validateTaxiData(taxiData) {
    const { matricula, anoCompra, marca, modelo, conforto } = taxiData;

    console.log('[validateTaxiData] Dados recebidos no backend:', { matricula, anoCompra, marca, modelo, conforto });

    const requiredFieldsError = validateRequiredFields(taxiData);
    if (requiredFieldsError) {
        console.error('Erro de validacao: Campos obrigatorios a faltar: ', requiredFieldsError);
        return requiredFieldsError;
    }

    const plateError = validatePlate(matricula);
    if (plateError) {
        console.error('Erro de validacao: Matricula invalida:', plateError);
        return plateError;
    }

    const yearError = validateYear(anoCompra);
    if (yearError) {
        console.error('Erro de validacao: Ano de compra invalido:', yearError);
        return yearError;
    }

    const brandError = validateBrand(marca);
    if (brandError) {
        console.error('Erro de validacao: Marca invalida:', brandError);
        return brandError;
    }

    const modelError = validateModel(marca, modelo);
    if (modelError) {
        console.error('Erro de validacao: Modelo invalido:', modelError);
        return modelError;
    }

    const comfortError = validateComfort(conforto);
    if (comfortError) {
        console.error('Erro de validacao: Nivel de conforto invalido:', comfortError);
        return comfortError;
    }

    return null;
}

module.exports = {
    validateTaxiData,
    validateRequiredFields,
    validatePlate,
    validateYear,
    validateBrand,
    validateModel,
    validateComfort
};