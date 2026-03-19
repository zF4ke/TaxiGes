# TaxiGes

O **TaxiGes** é uma aplicação web desenvolvida para modernizar a gestão de uma empresa de táxis, permitindo o controlo de frotas, motoristas, turnos e pedidos de serviço através de uma interface intuitiva e funcional.

## Tecnologias Utilizadas

Este projeto utiliza a **stack MEAN** (MongoDB, Express, Angular, Node.js):
**Frontend:** Angular (v18+)
**Backend:** Node.js e Express.js 
**Base de Dados:** MongoDB
**Testes:** Jest e Supertest para o backend

## Funcionalidades Principais

**Gestão de Frota:** Registo e manutenção de táxis por filial.
**Gestão de Recursos Humanos:** Cadastro e monitorização de motoristas.
**Controlo Operacional:** Gestão de turnos e atribuição de veículos.
**Serviços e Viagens:** Registo de pedidos de táxi, cálculo de preços e histórico de viagens.
**Relatórios:** Painéis com estatísticas sobre frotas, motoristas e faturação.

## Estrutura do Projeto

- `frontend/` - Aplicação Angular
- `backend/` - API em Node.js/Express

## Como Executar

### Backend

```bash
cd backend
npm install
npm run dev
```

Executar os testes com jest:
```bash
npm test
```

Aceder à API em `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
ng serve --open
```

Aceder a aplicação em `http://localhost:4200`
