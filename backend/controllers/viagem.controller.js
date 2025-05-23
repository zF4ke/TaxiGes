const Viagem = require('../models/viagem.model');
const Turno = require('../models/turno.model');    
const Cliente = require('../models/cliente.model');
const Taxi = require('../models/taxi.model')
const Pedido = require('../models/pedido.model')
const Preco = require('../models/preco.model')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

async function obterCoordenadas(morada, transform = true) {
  try {
    let endereco
    if (transform) {
      endereco = construirEndereco(morada);
    } else {
      endereco = morada;
    }
  
    console.log("Obtendo coordenadas para:", endereco);
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
  } catch (error) {
    console.error("Erro ao obter coordenadas:", error);
    return {
      // fcul
      lat: 38.756734,
      lon: -9.155412	
    }
  }
}

async function calcularPrecoViagem({ tipo, inicio, fim }) {
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
    const motoristaId = dados.turno.motorista;

    const pedido = await Pedido.findOne({
      status: 'aceite',
      motoristaSelecionado: motoristaId
    }).sort({ updatedAt: -1 })
      .populate('cliente')
      .populate('motoristaSelecionado')
      .populate('motoristasRejeitados');

    if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado ou não aceite.' });
    }

    // RIA 19: O número de pessoas tem de ser pelo menos 1
    if (!pedido.numeroPessoas || pedido.numeroPessoas < 1) {
      throw new Error('O número de pessoas tem de ser pelo menos 1.');
    }

    // Coordenadas do motorista (se não vierem do frontend, usar FCUL)
    const motoristaCoords = pedido.motoristaCoords || { lat: 38.756734, lon: -9.155412 };

    // Coordenadas do cliente (origem da viagem)
    const coordsOrigem = await obterCoordenadas(pedido.localizacaoAtual);
    const coordsDestino = await obterCoordenadas(pedido.destino);

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

    console.log(`Distância motorista -> cliente: ${kmMotoristaCliente} km`);
    console.log(`Distância cliente -> destino: ${km} km`);

    // RIA 20: Os quilómetros percorridos têm de ser positivos
    if (km < 0) throw new Error("Distância inválida: os quilómetros percorridos têm de ser positivos.");

    // Hora de início: agora + tempo estimado de chegada
    const inicio = new Date(Date.now() /* + tempoEstimadoChegadaTaxi * 60000 */);

    console.log(`Hora de início: ${inicio.toISOString()}`);
    console.log(`Tempo estimado de chegada do táxi: ${tempoEstimadoChegadaTaxi} minutos`);

    // RIA 2: O período da viagem tem de estar contido no período do turno
    if (!dados.turno || !dados.turno.inicio || !dados.turno.fim) {
      throw new Error('Informação do turno em falta.');
    }
    const turnoInicio = new Date(dados.turno.inicio);
    const turnoFim = new Date(dados.turno.fim);
    if (inicio < turnoInicio || inicio > turnoFim) {
      throw new Error('O início da viagem tem de estar contido no período do turno.');
    }

    // RIA 18: As viagens de um turno vão do número de sequência 1 em diante
    const ultimaViagem = await Viagem.findOne({ "turno._id": dados.turno._id }).sort({ numeroSequencia: -1 })
      .populate('cliente')
      .populate('pedido')
      .populate('turno');
    const novoNumeroSequencia = ultimaViagem ? ultimaViagem.numeroSequencia + 1 : 1;

    // Cálculo do custo
    // const custoTotal = await calcularPrecoViagem({
    //     tipo: dados.turno.taxi.conforto,
    //     inicio,
    //     fim: inicio // Use only inicio for price estimation for now
    // });
    // calculate based on km for now (// 4 min/km (como viagem))
    const precoPorKm = await Preco.findOne();
    if (!precoPorKm) {
      throw new Error('Tabela de preços não encontrada.');
    }
    
    let precoPorMinuto = precoPorKm.precoBasico;
    if (dados.turno.taxi.conforto === 'luxuoso') {
      precoPorMinuto = precoPorKm.precoLuxo;
    }

    const custoTotal = km * precoPorMinuto; // km * preço por km
    console.log(`Custo total da viagem: ${custoTotal} €`);
    

    console.log(`Dados da viagem:`, {
      ...dados,
      inicio,
      custoTotal
    });

    // encontrar pedido deste motorista, cujo status é aceite
    console.log(`Motorista ID: ${motoristaId}`);
    console.log(`dados.turno.motorista: ${dados.turno.motorista}`);
    console.log(`dados.turno.motorista._._id: ${dados.turno.motorista._id}`);


    console.log(`Inicio: ${inicio}`);

    const viagem = new Viagem({
        localInicio: dados.moradaInicio,
        turno: dados.turno,
        cliente: dados.cliente,
        pedido: pedido,
        numeroSequencia: novoNumeroSequencia,
        quilometrosPercorridos: km,
        inicio: inicio,
        preco: custoTotal,
        numeroPessoas: dados.numeroPessoas,
        status: 'ativa'
        // fim and localFim are not set at creation
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
    const viagens = await Viagem.find()
      .populate('cliente')
      .populate('pedido')
      .populate('turno');
    res.json(viagens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Procurar uma viagem por ID
exports.getViagemById = async (req, res) => {
  try {
    const viagem = await Viagem.findById(req.params.id)
      .populate('cliente')
      .populate('pedido')
      .populate('turno');
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

exports.findViagensByMotorista = async (req, res) => {
  try {
    const motoristaIdDaRota = req.params.motoristaId;

    if (!motoristaIdDaRota || !motoristaIdDaRota.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID do motorista inválido ou em falta.' });
    }
    const turnosDoMotorista = await Turno.find({ motorista: motoristaIdDaRota }).select('_id motorista');

    if (!turnosDoMotorista || turnosDoMotorista.length === 0) {
      return res.status(200).json([]);
    }

    const idsDosTurnos = turnosDoMotorista.map(turno => turno._id);    const viagensDoMotorista = await Viagem.find({ turno: { $in: idsDosTurnos } })
      .populate({
          path: 'turno',
          populate: [
            { path: 'motorista' },
            { path: 'taxi' }
          ]
      })
      .sort({ inicio: -1 })
      .populate('cliente')
      .populate('pedido');

    const viagensFormatadas = viagensDoMotorista.map(v => {
      const viagemObj = v.toObject();
      return {
        _id: viagemObj._id.toString(),
        inicio: viagemObj.inicio ? new Date(viagemObj.inicio).toISOString() : "N/D",
        fim: viagemObj.fim ? new Date(viagemObj.fim).toISOString() : undefined,
        localInicio: viagemObj.localInicio,
        localFim: viagemObj.localFim,
        quilometrosPercorridos: viagemObj.quilometrosPercorridos,
        preco: viagemObj.preco,
        numeroPessoas: viagemObj.numeroPessoas,
        status: viagemObj.status,
        turno: {
          _id: viagemObj.turno._id,
          motorista: viagemObj.turno.motorista,
          taxi: viagemObj.turno.taxi
        },
        pedido: {
          _id: viagemObj.pedido._id,
        }
      };
    });

    res.status(200).json(viagensFormatadas);

  } catch (error) {
    console.error("Erro no backend ao buscar viagens do motorista:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar buscar as viagens.", details: error.message });
  }
};

// Atualizar fim da viagem
exports.updateFimViagem = async (req, res) => {
  try {
    const { id } = req.params;
    const { fim, localFim } = req.body;
    if (!fim || !localFim) {
      return res.status(400).json({ message: 'Campos fim e localFim são obrigatórios.' });
    }
    const viagem = await Viagem.findById(id)
      .populate('cliente')
      .populate('pedido')
      .populate('turno');
    if (!viagem) {
      return res.status(404).json({ message: 'Viagem não encontrada.' });
    }

    // se a viagem já está concluída, não pode ser atualizada
    if (viagem.status === 'concluida') {
      return res.status(400).json({ message: 'A viagem já está concluída.' });
    }

    // calcular custo final real
    const coordsFim = await obterCoordenadas(localFim, false);
    const coordsInicio = await obterCoordenadas(viagem.localInicio, false);
    const kmPercorridos = haversine(
      coordsInicio.lat,
      coordsInicio.lon,
      coordsFim.lat,
      coordsFim.lon
    );

    console.log('localInicio:', viagem.localInicio);
    console.log('localFim:', localFim);
    console.log('Coordenadas início:', coordsInicio);
    console.log('Coordenadas fim:', coordsFim);
    console.log(`Quilómetros percorridos: ${kmPercorridos} km`);

    const precoPorKm = await Preco.findOne();
    if (!precoPorKm) {
      throw new Error('Tabela de preços não encontrada.');
    }
    let precoPorMinuto = precoPorKm.precoBasico;
    if (viagem.turno.taxi.conforto === 'luxuoso') {
      precoPorMinuto = precoPorKm.precoLuxo;
    }
    const custoFinal = kmPercorridos * precoPorMinuto; // km * preço por km
    console.log(`Custo final da viagem: ${custoFinal} €`);

    viagem.fim = new Date(fim);
    viagem.localFim = localFim;
    viagem.quilometrosPercorridos = kmPercorridos;
    viagem.preco = custoFinal; // Atualiza o preço final da viagem
    viagem.status = 'concluida'; // Atualiza o status da viagem para concluída
    await viagem.save();
    res.json(viagem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRelatorioViagens = async (req, res) => {
  try {
    let { inicio, fim } = req.query;
    const hoje = new Date();
    if (!inicio) inicio = hoje.toISOString().slice(0, 10);
    if (!fim) fim = hoje.toISOString().slice(0, 10);
    const dataInicio = new Date(`${inicio}T00:00:00.000Z`);
    const dataFim = new Date(`${fim}T23:59:59.999Z`);

    const Viagem = require('../models/viagem.model');
    const viagens = await Viagem.find({
      status: 'concluida',
      inicio: { $gte: dataInicio, $lte: dataFim }
    });

    let totalViagens = viagens.length;
    let totalHoras = 0;
    let totalKm = 0;

    viagens.forEach(v => {
      if (v.inicio && v.fim) {
        const horas = (new Date(v.fim) - new Date(v.inicio)) / (1000 * 60 * 60);
        totalHoras += horas;
      }
      if (v.quilometrosPercorridos) {
        totalKm += v.quilometrosPercorridos;
      }
    });

    res.json({
      periodo: { inicio, fim },
      totais: {
        totalViagens,
        totalHoras: Number(totalHoras.toFixed(2)),
        totalKm: Number(totalKm.toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao gerar relatório total de viagens', details: err.message });
  }
}

exports.findViagensByTaxi = async (req, res) => {
  try {
    const taxiId = req.params.taxiId;
    
    if (!taxiId || !taxiId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID do táxi inválido ou em falta.' });
    }

    const turnosDoTaxi = await Turno.find({ taxi: taxiId }).select('_id taxi');

    if (!turnosDoTaxi || turnosDoTaxi.length === 0) {
      return res.status(200).json([]);
    }

    const idsDosTurnos = turnosDoTaxi.map(turno => turno._id);
    const viagensDoTaxi = await Viagem.find({ turno: { $in: idsDosTurnos } })
      .populate({
          path: 'turno',
          model: Turno,
          populate: { path: 'taxi' }
      })
      .sort({ inicio: -1 })
      .populate('cliente')
      .populate('pedido');

    const viagensFormatadas = viagensDoTaxi.map(v => {
      return {
        _id: v._id.toString(),
        inicio: v.inicio ? new Date(v.inicio).toISOString() : "N/D",
        fim: v.fim ? new Date(v.fim).toISOString() : undefined,
        localInicio: v.localInicio,  
        localFim: v.localFim,
        quilometrosPercorridos: v.quilometrosPercorridos,
        preco: v.preco,
        numeroPessoas: v.numeroPessoas,
        status: v.status
      };
    });

    res.status(200).json(viagensFormatadas);

  } catch (error) {
    console.error("Erro no backend ao buscar viagens do táxi:", error);
    res.status(500).json({ 
      message: "Ocorreu um erro no servidor ao tentar buscar as viagens.", 
      details: error.message 
    });
  }
};