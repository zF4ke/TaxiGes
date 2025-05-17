import { Genero } from "./constants";

export interface Cliente {
    _id: string;
    nome: string;
    nif: string;
    genero: Genero;
    anoNascimento: number;
    createdAt?: Date;
    updatedAt?: Date;
}
