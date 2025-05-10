const Viagem = require('../models/viagem.model');
const fetch = require('node-fetch');

// Funções auxiliares
function construirEndereco(morada) {
  const partes = [
    morada.rua,
    morada.numeroPorta,
    morada.codigoPostal,
    morada.localidade,
    'Portugal'
  ];
  return partes.filter(Boolean).join(', ');
}

async function obterCoordenadas(morada) {
  const endereco = construirEndereco(morada);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'TaxiApp/1.0 (grupo@app.com)' }
  });

  if (!response.ok) throw new Error("Erro ao aceder ao Nominatim");

  const resultados = await response.json();
  if (resultados.length === 0) throw new Error("Morada não encontrada");

  return {
    lat: parseFloat(resultados[0].lat),
    lon: parseFloat(resultados[0].lon)
  };
}

async function calcularPrecoViagem({ tipo, inicio, fim }) {
  const Preco = require('../models/preco.model');
  const preco = await Preco.findOne();
  if (!preco) throw new Error('Tabela de preços não encontrada');

  // Calcular duração em minutos
  const minutosInicio = inicio.getHours() * 60 + inicio.getMinutes();
  const minutosFim = fim.getHours() * 60 + fim.getMinutes();
  let duracao = minutosFim - minutosInicio;
  if (duracao < 0) duracao += 24 * 60;

  // Calcular minutos noturnos (21h às 6h)
  let minutosNoturnos = 0;
  for (let i = 0; i < duracao; i++) {
    const horaAtual = Math.floor((minutosInicio + i) / 60) % 24;
    if (horaAtual >= 21 || horaAtual < 6) minutosNoturnos++;
  }
  const minutosNormais = duracao - minutosNoturnos;

  const precoPorMinuto = tipo === 'luxuoso' ? preco.precoLuxo : preco.precoBasico;
  return minutosNormais * precoPorMinuto +
         minutosNoturnos * precoPorMinuto * (1 + preco.agravamento / 100);
}

function toRad(x) {
  return x * Math.PI / 180;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Criar uma nova viagem
exports.createViagem = async (req, res) => {
  try {
    const dados = req.body;

    // RIA 19: O número de pessoas tem de ser pelo menos 1
    if (!dados.numeroPessoas || dados.numeroPessoas < 1) {
      throw new Error('O número de pessoas tem de ser pelo menos 1.');
    }

    // Coordenadas do motorista (se não vierem do frontend, usar FCUL)
    const motoristaCoords = dados.motoristaCoords || { lat: 38.756734, lon: -9.155412 };

    // Coordenadas do cliente (origem da viagem)
    const coordsOrigem = await obterCoordenadas(dados.moradaInicio);
    const coordsDestino = await obterCoordenadas(dados.moradaFim);

    // Distância motorista -> cliente
    const kmMotoristaCliente = haversine(
      motoristaCoords.lat,
      motoristaCoords.lon,
      coordsOrigem.lat,
      coordsOrigem.lon
    );

    // Tempo estimado de chegada do táxi (em minutos)
    const tempoEstimadoChegadaTaxi = kmMotoristaCliente * 4;

    // Distância cliente -> destino
    const km = haversine(
      coordsOrigem.lat,
      coordsOrigem.lon,
      coordsDestino.lat,
      coordsDestino.lon
    );

    // RIA 20: Os quilómetros percorridos têm de ser positivos
    if (km <= 0) throw new Error("Distância inválida: os quilómetros percorridos têm de ser positivos.");

    // Hora de início: agora + tempo estimado de chegada
    const inicio = new Date(Date.now() + tempoEstimadoChegadaTaxi * 60000);

    // Tempo total da viagem (em minutos)
    const tempoTotalMinutos = km * 4;

    // Hora de fim: início + tempo total da viagem
    const fim = new Date(inicio.getTime() + tempoTotalMinutos * 60000);

    // RIA 5: O início de um período tem de ser anterior ao seu fim
    if (inicio >= fim) {
      throw new Error('O início do período tem de ser anterior ao fim.');
    }

    // RIA 2: O período da viagem tem de estar contido no período do turno
    if (!dados.turno || !dados.turno.inicio || !dados.turno.fim) {
      throw new Error('Informação do turno em falta.');
    }
    const turnoInicio = new Date(dados.turno.inicio);
    const turnoFim = new Date(dados.turno.fim);
    if (inicio < turnoInicio || fim > turnoFim) {
      throw new Error('O período da viagem tem de estar contido no período do turno.');
    }

    // RIA 18: As viagens de um turno vão do número de sequência 1 em diante
    const ultimaViagem = await Viagem.findOne({ "turno._id": dados.turno._id }).sort({ numeroSequencia: -1 });
    const novoNumeroSequencia = ultimaViagem ? ultimaViagem.numeroSequencia + 1 : 1;

    // Cálculo do custo
    const custoTotal = await calcularPrecoViagem({
        tipo: dados.turno.tipoCarro,
        inicio,
        fim
    });

    const viagem = new Viagem({
        ...dados,
        cliente: dados.cliente,
        numeroSequencia: novoNumeroSequencia,
        quilometrosPercorridos: km,
        inicio,
        fim,
        preco: custoTotal
    });

    await viagem.save();
    res.status(201).json(viagem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obter todas as viagens
exports.getAllViagens = async (req, res) => {
  try {
    const viagens = await Viagem.find();
    res.json(viagens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Procurar uma viagem por ID
exports.getViagemById = async (req, res) => {
  try {
    const viagem = await Viagem.findById(req.params.id);
    if (!viagem) return res.status(404).json({ message: 'Viagem não encontrada' });
    res.json(viagem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Apagar uma viagem por ID
exports.deleteViagemById = async (req, res) => {
  try {
    const viagem = await Viagem.findByIdAndDelete(req.params.id);
    if (!viagem) return res.status(404).json({ message: 'Viagem não encontrada' });
    res.json({ message: 'Viagem removida com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};