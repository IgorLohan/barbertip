# BarberTip - Sistema de Agendamento para Barbearias

Sistema completo de agendamento para barbearias com arquitetura multi-tenant (SaaS).

## 🚀 Stack Tecnológica

### Back-end
- **NestJS** com Fastify
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **Swagger** para documentação da API
- **class-validator** para validação de DTOs

### Front-end
- **Next.js** (App Router)
- **Tailwind CSS**
- **Axios** para consumo da API

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB 6+
- npm ou yarn

## 🔧 Instalação

### Back-end

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar servidor de desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3000`
A documentação Swagger em `http://localhost:3000/docs`

### Front-end

```bash
cd frontend
npm install
npm run dev
```

## 📚 Estrutura do Projeto

```
barbertip/
├── src/
│   ├── auth/           # Módulo de autenticação
│   ├── users/          # Módulo de usuários
│   ├── companies/      # Módulo de empresas (multi-tenant)
│   ├── barbers/        # Módulo de barbeiros
│   ├── services/       # Módulo de serviços
│   ├── schedules/      # Módulo de agendamentos
│   └── common/         # Utilitários compartilhados
└── frontend/           # Aplicação Next.js
```

## 🔐 Autenticação

A API utiliza JWT Bearer Token. Para autenticar:

1. Faça login em `/v1/auth/login`
2. Use o token retornado no header: `Authorization: Bearer <token>`

## 📝 Endpoints Principais

### Autenticação
- `POST /v1/auth/login` - Login de usuário

### Usuários
- `GET /v1/users` - Listar usuários
- `POST /v1/users` - Criar usuário (ADMIN)
- `GET /v1/users/:id` - Buscar usuário
- `PATCH /v1/users/:id` - Atualizar usuário
- `DELETE /v1/users/:id` - Remover usuário (ADMIN)

### Serviços
- `GET /v1/services` - Listar serviços
- `POST /v1/services` - Criar serviço (ADMIN)
- `GET /v1/services/:id` - Buscar serviço
- `PATCH /v1/services/:id` - Atualizar serviço (ADMIN)
- `DELETE /v1/services/:id` - Remover serviço (ADMIN)

### Barbeiros
- `GET /v1/barbers` - Listar barbeiros
- `POST /v1/barbers` - Criar barbeiro (ADMIN)
- `GET /v1/barbers/:id` - Buscar barbeiro
- `PATCH /v1/barbers/:id` - Atualizar barbeiro (ADMIN)
- `DELETE /v1/barbers/:id` - Remover barbeiro (ADMIN)

### Agendamentos
- `GET /v1/schedules` - Listar agendamentos
- `POST /v1/schedules` - Criar agendamento
- `GET /v1/schedules/available-slots` - Listar horários disponíveis
- `GET /v1/schedules/:id` - Buscar agendamento
- `PATCH /v1/schedules/:id` - Atualizar agendamento
- `PATCH /v1/schedules/:id/status` - Atualizar status
- `DELETE /v1/schedules/:id` - Remover agendamento

## 🎯 Regras de Negócio

1. **Conflito de Horários**: Um barbeiro não pode ter dois agendamentos que se sobreponham
2. **Cálculo Automático**: O horário final (`endAt`) é calculado automaticamente: `startAt + duração do serviço`
3. **Validação no Back-end**: Todas as validações críticas são feitas no servidor
4. **Multi-tenant**: Todos os recursos são isolados por `companyId`

## 👥 Papéis (Roles)

- **ADMIN**: Acesso total ao sistema
- **BARBEIRO**: Pode ver seus próprios agendamentos
- **CLIENTE**: Pode criar e ver seus próprios agendamentos

## 📊 Status de Agendamento

- `AGENDADO`: Agendamento criado
- `CONFIRMADO`: Agendamento confirmado
- `CANCELADO`: Agendamento cancelado
- `CONCLUIDO`: Serviço realizado

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- JWT tokens com expiração configurável
- Validação de DTOs com class-validator
- Guards para proteção de rotas
- Soft delete para preservar histórico
