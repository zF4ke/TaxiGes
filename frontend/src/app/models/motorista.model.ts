import { Genero } from './constants';
import { Morada } from './morada.model';

export interface Motorista {
    _id: string;
    nome: string;
    nif: string;
    genero: Genero;
    anoNascimento: number;
    morada: Morada;
    cartaConducao: string;
    createdAt?: Date;
    updatedAt?: Date;
}
