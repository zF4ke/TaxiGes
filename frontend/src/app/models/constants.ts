export type NivelConforto = 'básico' | 'luxuoso';
export type PedidoStatus = 'pendente' | 'aceite' | 'rejeitado' | 'cancelado';
export type Genero = 'feminino' | 'masculino';

export const NIVEIS_CONFORTO: NivelConforto[] = ['básico', 'luxuoso'];
export const PEDIDO_STATUS: PedidoStatus[] = ['pendente', 'aceite', 'rejeitado', 'cancelado'];

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
];
export const TAXI_MODELS = {
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