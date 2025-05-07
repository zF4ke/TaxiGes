import { Morada } from './morada.model';
import { Genero } from './motorista.model';

export interface Pessoa {
    nif: string;
    nome: string;
    genero: Genero;
    anoNascimento: number;
    morada: Morada;
}