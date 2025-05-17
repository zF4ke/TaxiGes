import { NivelConforto } from "./constants";

export interface Taxi {
    _id: string;
    matricula: string;
    anoCompra: number;
    marca: string;
    modelo: string;
    conforto: NivelConforto;
    lugares: number;
    createdAt?: Date;
    updatedAt?: Date;
}
