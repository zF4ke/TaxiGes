import { Cliente } from './cliente.model';
import { NivelConforto, PedidoStatus } from './constants';
import { Morada } from './morada.model';
import { Motorista } from './motorista.model';

export interface Pedido {
    _id?: string; // MongoDB ObjectId
    cliente: Cliente; 
    localizacaoAtual: Morada;
    destino: Morada;
    distanciaKm?: number;
    motoristaCoords?: {
        lat: number;
        lon: number;
    };
    nivelConforto: NivelConforto;
    numeroPessoas: number;
    status?: PedidoStatus;
    motoristaSelecionado?: Motorista;
    motoristasRejeitados?: Motorista[];
    clienteAceitouMotorista: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
