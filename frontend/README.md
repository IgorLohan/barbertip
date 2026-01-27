# BarberTip Frontend

Front-end do sistema de agendamento para barbearias desenvolvido com Next.js 14 (App Router) e Tailwind CSS.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL da API

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3001`

## 📁 Estrutura

```
frontend/
├── app/                    # App Router do Next.js
│   ├── login/             # Página de login
│   ├── agendar/           # Página de agendamento
│   ├── meus-agendamentos/ # Lista de agendamentos do cliente
│   └── admin/             # Painel administrativo
│       ├── servicos/      # Gerenciamento de serviços
│       ├── barbeiros/     # Gerenciamento de barbeiros
│       └── agendamentos/  # Gerenciamento de agendamentos
├── components/            # Componentes reutilizáveis
├── contexts/             # Contextos React (Auth)
└── lib/                  # Utilitários (API client)
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

## 📱 Funcionalidades

- ✅ Autenticação com JWT
- ✅ Agendamento de serviços
- ✅ Visualização de agendamentos
- ✅ Painel administrativo
- ✅ Gerenciamento de serviços
- ✅ Gerenciamento de barbeiros
- ✅ Gerenciamento de agendamentos

## 🎨 Tecnologias

- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas
