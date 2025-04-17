export type TaxiConforto = 'básico' | 'luxuoso';

export interface Taxi {
    _id?: string;
    matricula: string;
    anoCompra: number;
    marca: string;
    modelo: string;
    conforto: TaxiConforto;
    createdAt?: Date;
    updatedAt?: Date;
}

// Constants matching backend
export const TAXI_BRANDS = [
    'Toyota',
    'Volkswagen',
    'Ford',
    'Honda',
    'Mercedes-Benz',
    'BMW',
    'Audi',
    'Hyundai',
    'Nissan',
    'Peugeot'
] as const;

export const TAXI_MODELS: { [key: string]: string[] } = {
    'Toyota': ['Camry', 'Corolla', 'Prius', 'Avensis'],
    'Volkswagen': ['Passat', 'Jetta', 'Arteon'],
    'Ford': ['Mondeo', 'Focus', 'Fusion'],
    'Honda': ['Accord', 'Civic', 'Insight'],
    'Mercedes-Benz': ['Classe E', 'Classe C', 'Classe S'],
    'BMW': ['Série 5', 'Série 3', 'Série 7'],
    'Audi': ['A6', 'A4', 'A8'],
    'Hyundai': ['Sonata', 'Elantra', 'IONIQ'],
    'Nissan': ['Altima', 'Sentra', 'Leaf'],
    'Peugeot': ['508', '308', '408']
};