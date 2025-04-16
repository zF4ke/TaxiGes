# TaxiGes

Sistema de gestão de táxis.

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

Para popular a base de dados com dados de teste:
```bash
npm run seed
```

Aceder à API em `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
ng serve
```

Aceder a aplicação em `http://localhost:4200`