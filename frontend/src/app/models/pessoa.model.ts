import { Morada } from './morada.model';
export type Genero = 'feminino' | 'masculino';

export interface Pessoa {
    nif: string;
    nome: string;
    genero: Genero;
    anoNascimento: number;
    morada: Morada;
}