import { PessoaSimples } from './pessoa-simples.model';

export interface Cliente {
  _id?: string;
  pessoa: PessoaSimples;
  createdAt?: Date;
  updatedAt?: Date;
}
