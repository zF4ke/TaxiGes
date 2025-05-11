import { Cliente } from './cliente.model';
import { Morada } from './morada.model';
import { PedidoStatus } from './pedido-status.type';
import { NivelConforto } from './nivel-conforto.type';
import { Pessoa } from './pessoa.model';

export interface Pedido {
  _id?: string;
  cliente: Cliente;
  localizacaoAtual: Morada;
  destino: Morada;
  distanciaKm: number;
  nivelConforto: NivelConforto;
  numeroPessoas: number;
  status?: PedidoStatus;
  motoristaSelecionado?: {
    _id: string;
    pessoa: Pessoa;
  };
  motoristaCoords?: {
    lat: number;
    lon: number;
  };
  motoristasRejeitados?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}