const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('API de Táxis', () => {
    const validTaxi = {
        matricula: 'AA-12-BB',
        anoCompra: 2022,
        marca: 'Toyota',
        modelo: 'Camry',
        conforto: 'básico'
    };

    describe('POST /api/taxis - Criar Táxi', () => {
        beforeEach(async () => {
            await mongoose.connection.collection('taxis').deleteMany({});
        });

        it('deve criar um novo táxi com dados válidos', async () => {
            const response = await request(app)
                .post('/api/taxis')
                .send(validTaxi);
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.matricula).toBe(validTaxi.matricula);
        });

        it('deve falhar ao criar táxi com matrícula inválida - sem letras', async () => {
            const response = await request(app)
                .post('/api/taxis')
                .send({...validTaxi, matricula: '11-22-33'});
            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar táxi com matrícula inválida - sem números', async () => {
            const response = await request(app)
                .post('/api/taxis')
                .send({...validTaxi, matricula: 'AA-BB-CC'});
            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar táxi com ano de compra no futuro', async () => {
            const nextYear = new Date().getFullYear() + 1;
            const response = await request(app)
                .post('/api/taxis')
                .send({...validTaxi, anoCompra: nextYear});
            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar táxi com marca inválida', async () => {
            const response = await request(app)
                .post('/api/taxis')
                .send({...validTaxi, marca: 'Invalid'});
            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar táxi com modelo que não corresponde à marca', async () => {
            const response = await request(app)
                .post('/api/taxis')
                .send({...validTaxi, modelo: 'Série 3'});
            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar táxi com nível de conforto inválido', async () => {
            const response = await request(app)
                .post('/api/taxis')
                .send({...validTaxi, conforto: 'premium'});
            expect(response.statusCode).toBe(400);
        });

        it('deve aceitar diferentes modelos da mesma marca', async () => {
            const response = await request(app)
                .post('/api/taxis')
                .send({...validTaxi, modelo: 'Corolla'});
            expect(response.statusCode).toBe(201);
            expect(response.body.modelo).toBe('Corolla');
        });
    });

    describe('GET /api/taxis - Listar Táxis', () => {
        beforeEach(async () => {
            await mongoose.connection.collection('taxis').deleteMany({});
        });

        it('deve retornar lista vazia quando não há táxis', async () => {
            const response = await request(app).get('/api/taxis');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('deve retornar lista com táxis cadastrados', async () => {
            await request(app).post('/api/taxis').send(validTaxi);
            await request(app).post('/api/taxis').send({...validTaxi, matricula: 'BB-34-CC', modelo: 'Corolla'});
            const response = await request(app).get('/api/taxis');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].matricula).toBe('BB-34-CC');
            expect(response.body[1].matricula).toBe('AA-12-BB');
        });
    });
});
