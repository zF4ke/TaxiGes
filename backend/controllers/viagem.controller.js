const Viagem = require('../models/viagem.model');
const Turno = require('../models/turno.model');    
const Cliente = require('../models/cliente.model');
const Taxi = require('../models/taxi.model')
const Pedido = require('../models/pedido.model')

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
  try {
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

    console.log(`Distância motorista -> cliente: ${kmMotoristaCliente} km`);
    console.log(`Distância cliente -> destino: ${km} km`);

    // RIA 20: Os quilómetros percorridos têm de ser positivos
    if (km < 0) throw new Error("Distância inválida: os quilómetros percorridos têm de ser positivos.");

    // Hora de início: agora + tempo estimado de chegada
    const inicio = new Date(Date.now() /* + tempoEstimadoChegadaTaxi * 60000 */);

    console.log(`Hora de início: ${inicio.toISOString()}`);
    console.log(`Tempo estimado de chegada do táxi: ${tempoEstimadoChegadaTaxi} minutos`);

    // Tempo total da viagem (em minutos)
    const tempoTotalMinutos = km * 4;

    console.log(`Tempo total da viagem: ${tempoTotalMinutos} minutos`);

    // Hora de fim: início + tempo total da viagem
    const fim = new Date(inicio.getTime() + tempoTotalMinutos * 60000);

    // RIA 5: O início de um período tem de ser anterior ao seu fim
    if (inicio > fim) {
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

    // encontrar pedido deste motorista, cujo status é aceite
    const pedido = await Pedido.findOne({
        status: 'aceite',
        'motoristaSelecionado._id': dados.motorista._id,
    }).sort({ updatedAt: -1 });

    if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado ou não aceite.' });
    }

    const viagem = new Viagem({
        ...dados,
        turno: dados.turno._id,
        cliente: dados.cliente._id,
        pedidoId: pedido._id,
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

    const idsDosTurnos = turnosDoMotorista.map(turno => turno._id);
    const viagensDoMotorista = await Viagem.find({ turno: { $in: idsDosTurnos } })
      .populate({
          path: 'turno',
          model: Turno,
          select: 'motorista' 
      })
      .sort({ inicio: -1 }); 
    const viagensFormatadas = viagensDoMotorista.map(v => {
      const viagemObj = v.toObject(); 

      let motoristaIdParaFrontend = motoristaIdDaRota;
      if (viagemObj.turno && viagemObj.turno.motorista) {
        motoristaIdParaFrontend = viagemObj.turno.motorista.toString();
      }

      const pedidoIdParaFrontend = viagemObj.pedidoId || "N/D"; 

      let statusDaViagem = 'desconhecido';
      const agora = new Date();
      if (viagemObj.fim && new Date(viagemObj.fim) < agora) {
        statusDaViagem = 'concluida';
      } else if (viagemObj.inicio && new Date(viagemObj.inicio) <= agora) {
        statusDaViagem = 'ativa';
      } else if (viagemObj.inicio) {
        statusDaViagem = 'agendada';
      }

      return {
        _id: viagemObj._id.toString(),
        motoristaId: motoristaIdParaFrontend,
        pedidoId: pedidoIdParaFrontend, 
        dataHoraInicio: viagemObj.inicio ? new Date(viagemObj.inicio).toISOString() : "N/D",
        dataHoraFim: viagemObj.fim ? new Date(viagemObj.fim).toISOString() : undefined, 
        status: statusDaViagem,
      };
    });

    res.status(200).json(viagensFormatadas);

  } catch (error) {
    console.error("Erro no backend ao buscar viagens do motorista:", error);
    res.status(500).json({ message: "Ocorreu um erro no servidor ao tentar buscar as viagens.", details: error.message });
  }
};