# 🪒 BarberTip

Sistema completo de agendamento online para barbearias. Gerencie agendamentos, barbeiros, serviços e clientes de forma simples e eficiente.

![BarberTip](https://img.shields.io/badge/BarberTip-Sistema%20de%20Agendamento-primary?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E?style=for-the-badge&logo=nestjs)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb)

## 📋 Sobre o Projeto

O **BarberTip** é uma solução completa para gerenciamento de barbearias, permitindo que clientes agendem horários online 24/7, enquanto proprietários e gerentes têm controle total sobre agendamentos, barbeiros, serviços e relatórios.

### ✨ Funcionalidades Principais

- 🎯 **Agendamento Online**: Clientes podem agendar horários a qualquer momento
- 👥 **Gestão de Usuários**: Controle de clientes, barbeiros, gerentes e administradores
- 💼 **Gestão de Empresas**: Sistema multi-empresa para administradores
- 📊 **Dashboard Completo**: Estatísticas e relatórios em tempo real
- 📅 **Calendário Interativo**: Visualização de agendamentos por semana/mês
- 🔔 **Status de Agendamentos**: Controle de status (Agendado, Confirmado, Concluído, Cancelado)
- 🎨 **Interface Moderna**: Design responsivo com Preline UI e Tailwind CSS
- 📱 **Totalmente Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com SSR
- **React 18** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **Preline UI** - Componentes UI modernos
- **ApexCharts** - Gráficos e visualizações
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas

### Backend
- **NestJS 10** - Framework Node.js progressivo
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação baseada em tokens
- **Passport** - Middleware de autenticação
- **Swagger** - Documentação da API
- **Fastify** - Servidor HTTP de alta performance

## 📁 Estrutura do Projeto

```
barbertip/
├── frontend/          # Aplicação Next.js
│   ├── app/          # Páginas e rotas
│   ├── components/   # Componentes React reutilizáveis
│   ├── contexts/     # Contextos React (Auth)
│   ├── lib/          # Utilitários e configurações
│   └── public/       # Arquivos estáticos
│
├── back/             # API NestJS
│   ├── src/
│   │   ├── auth/     # Autenticação e autorização
│   │   ├── users/    # Gestão de usuários
│   │   ├── companies/# Gestão de empresas
│   │   ├── barbers/  # Gestão de barbeiros
│   │   ├── services/ # Gestão de serviços
│   │   ├── schedules/# Gestão de agendamentos
│   │   └── common/   # Decorators, guards e interfaces
│   └── ...
│
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- MongoDB (local ou Atlas)
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/barbertip.git
cd barbertip
```

2. **Configure o Backend**

```bash
cd back
npm install
```

Crie um arquivo `.env` baseado no `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/barbertip
JWT_SECRET=seu-jwt-secret-aqui
PORT=3001
```

3. **Configure o Frontend**

```bash
cd ../frontend
npm install
```

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Executando a Aplicação

**Backend:**
```bash
cd back
npm run start:dev
```

O servidor estará rodando em `http://localhost:3001`

**Frontend:**
```bash
cd frontend
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📚 Documentação da API

Quando o backend estiver rodando, a documentação Swagger estará disponível em:
```
http://localhost:3001/api
```

## 👥 Tipos de Usuário

O sistema possui 4 tipos de usuários com diferentes permissões:

- **ADMIN**: Acesso total ao sistema, pode gerenciar empresas, usuários e visualizar todos os dados
- **GERENTE**: Gerencia barbeiros, serviços e agendamentos da sua empresa
- **BARBEIRO**: Visualiza e gerencia seus próprios agendamentos
- **CLIENTE**: Pode agendar horários e visualizar seus agendamentos

## 🎨 Interface

A interface foi desenvolvida com foco em:
- ✅ Design moderno e limpo
- ✅ Totalmente responsiva
- ✅ Acessibilidade
- ✅ Performance otimizada
- ✅ Experiência do usuário intuitiva

## 📝 Scripts Disponíveis

### Backend
- `npm run start:dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm run start:prod` - Inicia em modo produção
- `npm run lint` - Executa o linter

### Frontend
- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila para produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linter

## 📧 Contato

Para mais informações, entre em contato através do WhatsApp.

