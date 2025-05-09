import { PessoaSimples } from './pessoa-simples.model';
import { Morada } from './morada.model';
import { PedidoStatus } from './pedido-status.type';
import { NivelConforto } from './nivel-conforto.type';
import { Pessoa } from './pessoa.model';

export interface Pedido {
  _id?: string;
  cliente: PessoaSimples;
  localizacaoAtual: Morada;
  destino: Morada;
  nivelConforto: NivelConforto;
  numeroPessoas: number;
  status?: PedidoStatus;
  motoristaSelecionado?: {
    _id: string;
    pessoa: Pessoa;
  };
  motoristasRejeitados?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}