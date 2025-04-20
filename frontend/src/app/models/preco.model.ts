export type tipoConforto = 'básico' | 'luxuoso';

export interface Preco {
    _id?: string;
    precoPorMinuto: number;
    tipo: tipoConforto;
    agravamento: number;
}