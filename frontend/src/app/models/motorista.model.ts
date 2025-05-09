import { Pessoa } from './pessoa.model';

export interface Motorista {
    _id?: string;
    pessoa: Pessoa;
    cartaConducao: string;
    createdAt?: Date;
    updatedAt?: Date;
}
