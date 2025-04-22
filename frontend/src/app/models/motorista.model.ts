export type Genero = 'feminino' | 'masculino';

export interface Morada {
    rua: string;
    numeroPorta?: string; 
    codigoPostal: string; 
    localidade: string;  
}

export interface Motorista {
    _id?: string; 
    nif: string; 
    nome: string; 
    genero: Genero; 
    anoNascimento: number; 
    cartaConducao: string;
    morada: Morada;
    createdAt?: Date; //PRECISO DE SABER ISTO? NAO SEI AINDA
    updatedAt?: Date; //MAIS VALE TER DO QUE NAO TER POR AGR
}
