const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    // jest.spyOn(console, 'log').mockImplementation(() => {});
    // jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('API de Motoristas', () => {
    const validMotorista = {
        pessoa: {
            nif: '123456789',
            nome: 'Pedro Silva',
            genero: 'masculino',
            anoNascimento: 1990,
            morada: {
                rua: 'Rua Principal',
                numeroPorta: '123',
                codigoPostal: '1000-100',
                localidade: 'Lisboa'
            }
        },
        cartaConducao: 'C-12345'
    };

    describe('POST /api/motoristas - Criar Motorista', () => {
        beforeEach(async () => {
            await mongoose.connection.collection('motoristas').deleteMany({});
        });

        it('deve criar um novo motorista com dados válidos', async () => {
            const response = await request(app)
                .post('/api/motoristas')
                .send(validMotorista);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.pessoa.nif).toBe(validMotorista.pessoa.nif);
            expect(response.body.pessoa.nome).toBe(validMotorista.pessoa.nome);
        });

        it('deve falhar ao criar motorista com NIF inválido', async () => {
            const response = await request(app)
                .post('/api/motoristas')
                .send({
                    ...validMotorista,
                    pessoa: {...validMotorista.pessoa, nif: '123'}
                });

            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar motorista com gênero inválido', async () => {
            const response = await request(app)
                .post('/api/motoristas')
                .send({
                    ...validMotorista,
                    pessoa: {...validMotorista.pessoa, genero: 'outro'}
                });

            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar motorista menor de idade', async () => {
            const anoAtual = new Date().getFullYear();
            const response = await request(app)
                .post('/api/motoristas')
                .send({
                    ...validMotorista,
                    pessoa: {...validMotorista.pessoa, anoNascimento: anoAtual - 17}
                });

            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar motorista com NIF duplicado', async () => {
            // Primeiro, criar um motorista
            await request(app).post('/api/motoristas').send(validMotorista);

            // Tentar criar outro motorista com o mesmo NIF
            const response = await request(app)
                .post('/api/motoristas')
                .send({
                    pessoa: {...validMotorista.pessoa, nif: validMotorista.pessoa.nif, nome: 'Diogo Lopes'},
                    cartaConducao: 'D-98765'
                });

            expect(response.statusCode).toBe(409);
        });

        it('deve falhar ao criar motorista com carta de condução duplicada', async () => {
            // Primeiro, criar um motorista
            await request(app).post('/api/motoristas').send(validMotorista);

            // Tentar criar outro motorista com a mesma carta
            const response = await request(app)
                .post('/api/motoristas')
                .send({
                    pessoa: {...validMotorista.pessoa, nif: '987654321', nome: 'Bruno Sousa'},
                    cartaConducao: validMotorista.cartaConducao
                });

            expect(response.statusCode).toBe(409);
        });

        it('deve aceitar motorista sem número de porta na morada', async () => {
            const motoristaData = {...validMotorista};
            delete motoristaData.pessoa.morada.numeroPorta;

            const response = await request(app)
                .post('/api/motoristas')
                .send(motoristaData);

            expect(response.statusCode).toBe(201);
            expect(response.body.pessoa.morada).not.toHaveProperty('numeroPorta');
        });

        it('deve falhar ao criar motorista sem código postal', async () => {
            const motoristaData = {...validMotorista};
            delete motoristaData.pessoa.morada.codigoPostal;

            const response = await request(app)
                .post('/api/motoristas')
                .send(motoristaData);

            expect(response.statusCode).toBe(400);
        });
    });

    describe('GET /api/motoristas - Listar Motoristas', () => {
        beforeEach(async () => {
            await mongoose.connection.collection('motoristas').deleteMany({});
        });

        it('deve retornar lista vazia quando não há motoristas', async () => {
            const response = await request(app).get('/api/motoristas');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('deve retornar lista com motoristas cadastrados', async () => {
            const res1 = await request(app).post('/api/motoristas').send({
                pessoa: {
                    nome: 'Pedro Silva',
                    nif: '123456789',
                    genero: 'masculino',
                    anoNascimento: 1990,
                    morada: {
                        rua: 'Rua A',
                        numeroPorta: '1',
                        codigoPostal: '1000-001',
                        localidade: 'Lisboa'
                    }
                },
                cartaConducao: 'C-12345'
            });
            expect(res1.statusCode).toBe(201);
        
            const res2 = await request(app).post('/api/motoristas').send({
                pessoa: {
                    nome: 'Sofia Reis',
                    nif: '987654321',
                    genero: 'feminino',
                    anoNascimento: 1990,
                    morada: {
                        rua: 'Rua B',
                        numeroPorta: '2',
                        codigoPostal: '1000-001',
                        localidade: 'Lisboa'
                    }
                },
                cartaConducao: 'D-98765'
            });
            expect(res2.statusCode).toBe(201);
        
            const response = await request(app).get('/api/motoristas');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(2);
        
            const nomes = response.body.map(m => m.pessoa.nome).sort();
            expect(nomes).toEqual(['Pedro Silva', 'Sofia Reis']);
        });
    });
});
