const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // tirar logs do console
    jest.spyOn(console, 'error').mockImplementation(() => {}); // tirar logs do console
    
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('API de Preços', () => {
    const validPreco = {
        precoPorMinuto: 0.50,
        tipo: 'básico',
        agravamento: 1.2
    };

    describe('POST /api/precos - Criar Preço', () => {
        beforeEach(async () => {
            await mongoose.connection.collection('precos').deleteMany({});
        });

        it('deve criar um novo preço com dados válidos', async () => {
            const response = await request(app)
                .post('/api/precos')
                .send(validPreco);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.precoPorMinuto).toBe(validPreco.precoPorMinuto);
            expect(response.body.tipo).toBe(validPreco.tipo);
        });

        it('deve falhar ao criar preço com valor negativo', async () => {
            const response = await request(app)
                .post('/api/precos')
                .send({...validPreco, precoPorMinuto: -1});

            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar preço com tipo inválido', async () => {
            const response = await request(app)
                .post('/api/precos')
                .send({...validPreco, tipo: 'premium'});

            expect(response.statusCode).toBe(400);
        });

        it('deve falhar ao criar preço já existente para o mesmo tipo', async () => {
            // Primeiro, criar um preço
            await request(app)
                .post('/api/precos')
                .send(validPreco);

            // Tentar criar outro preço com o mesmo tipo
            const response = await request(app)
                .post('/api/precos')
                .send(validPreco);

            expect(response.statusCode).toBe(400);
        });

        it('deve permitir criar preço para tipo diferente', async () => {
            // Primeiro, criar um preço básico
            await request(app)
                .post('/api/precos')
                .send(validPreco);

            // Criar preço luxuoso
            const response = await request(app)
                .post('/api/precos')
                .send({...validPreco, tipo: 'luxuoso'});

            expect(response.statusCode).toBe(201);
            expect(response.body.tipo).toBe('luxuoso');
        });
    });

    describe('GET /api/precos - Listar Preços', () => {
        beforeEach(async () => {
            await mongoose.connection.collection('precos').deleteMany({});
        });

        it('deve retornar lista vazia quando não há preços', async () => {
            const response = await request(app).get('/api/precos');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('deve retornar lista com preços cadastrados', async () => {
            // Criar dois preços
            await request(app)
                .post('/api/precos')
                .send(validPreco);

            await request(app)
                .post('/api/precos')
                .send({
                    ...validPreco,
                    tipo: 'luxuoso',
                    precoPorMinuto: 0.75
                });

            const response = await request(app).get('/api/precos');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].tipo).toBe('básico');
            expect(response.body[1].tipo).toBe('luxuoso');
        });
    });

    describe('GET /api/precos/:id - Buscar Preço', () => {
        let precoId;

        beforeEach(async () => {
            await mongoose.connection.collection('precos').deleteMany({});
            const response = await request(app)
                .post('/api/precos')
                .send(validPreco);
            precoId = response.body._id;
        });

        it('deve retornar preço por ID válido', async () => {
            const response = await request(app).get(`/api/precos/${precoId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.precoPorMinuto).toBe(validPreco.precoPorMinuto);
            expect(response.body.tipo).toBe(validPreco.tipo);
        });

        it('deve retornar 404 para ID inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app).get(`/api/precos/${fakeId}`);
            expect(response.statusCode).toBe(404);
        });
    });

    describe('PUT /api/precos/:id - Atualizar Preço', () => {
        let precoId;

        beforeEach(async () => {
            await mongoose.connection.collection('precos').deleteMany({});
            const response = await request(app)
                .post('/api/precos')
                .send(validPreco);
            precoId = response.body._id;
        });

        it('deve atualizar preço com dados válidos', async () => {
            const updateData = {
                ...validPreco,
                precoPorMinuto: 0.60,
                agravamento: 1.3
            };

            const response = await request(app)
                .put(`/api/precos/${precoId}`)
                .send(updateData);

            expect(response.statusCode).toBe(200);
            expect(response.body.precoPorMinuto).toBe(0.60);
            expect(response.body.agravamento).toBe(1.3);
        });

        it('não deve permitir atualizar para preço negativo', async () => {
            const response = await request(app)
                .put(`/api/precos/${precoId}`)
                .send({ ...validPreco, precoPorMinuto: -0.5 });

            expect(response.statusCode).toBe(400);
        });

        it('não deve permitir atualizar para agravamento negativo', async () => {
            const response = await request(app)
                .put(`/api/precos/${precoId}`)
                .send({ ...validPreco, agravamento: -0.5 });

            expect(response.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/precos/:id - Excluir Preço', () => {
        let precoId;

        beforeEach(async () => {
            await mongoose.connection.collection('precos').deleteMany({});
            const response = await request(app)
                .post('/api/precos')
                .send(validPreco);
            precoId = response.body._id;
        });

        it('deve excluir preço existente', async () => {
            const response = await request(app)
                .delete(`/api/precos/${precoId}`);

            expect(response.statusCode).toBe(200);

            // Verificar se foi realmente excluído
            const getResponse = await request(app).get(`/api/precos/${precoId}`);
            expect(getResponse.statusCode).toBe(404);
        });

        it('deve retornar 404 ao tentar excluir preço inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .delete(`/api/precos/${fakeId}`);

            expect(response.statusCode).toBe(404);
        });
    });
});