import { Motorista } from "./motorista.model";
import { Taxi } from "./taxi.model";

export interface Turno {
    _id: string;
    motorista: Motorista;
    taxi: Taxi;
    inicio: Date;
    fim: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
