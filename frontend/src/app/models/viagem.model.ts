export interface Viagem {
    _id: string;
    numeroSequencia: number;
    cliente: string; // ObjectId
    pedido: string; // ObjectId
    turno: string; // ObjectId
    inicio: Date;
    fim: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
