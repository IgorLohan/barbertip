# 🚀 Instruções de Instalação e Uso - BarberTip

## 📋 Pré-requisitos

- Node.js 18+ instalado
- MongoDB 6+ instalado e rodando
- npm ou yarn

## 🔧 Instalação do Back-end

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações:
# MONGODB_URI=mongodb://localhost:27017/barbertip
# JWT_SECRET=seu-secret-key-aqui
# JWT_EXPIRES_IN=24h

# 3. Iniciar servidor de desenvolvimento
npm run start:dev
```

O back-end estará disponível em:
- API: `http://localhost:3000/v1`
- Swagger: `http://localhost:3000/docs`

## 🎨 Instalação do Front-end

```bash
# 1. Entrar na pasta do frontend
cd frontend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3000/v1

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

O front-end estará disponível em `http://localhost:3001`

## 🗄️ Configuração do MongoDB

Certifique-se de que o MongoDB está rodando:

```bash
# Windows (se instalado como serviço)
# O MongoDB já deve estar rodando automaticamente

# Linux/Mac
mongod
```

## 👤 Criando o Primeiro Usuário

Para criar o primeiro usuário ADMIN, você pode:

1. **Usar o Swagger** (`http://localhost:3000/docs`):
   - Faça login primeiro (crie um usuário via endpoint de users se necessário)
   - Use o endpoint `POST /v1/users` para criar um usuário ADMIN

2. **Ou usar o MongoDB diretamente**:
   ```javascript
   // Conecte ao MongoDB e execute:
   use barbertip
   db.users.insertOne({
     name: "Admin",
     email: "admin@barbertip.com",
     password: "$2b$10$...", // Hash bcrypt da senha "senha123"
     role: "ADMIN",
     companyId: ObjectId("..."), // Crie uma company primeiro
     active: true
   })
   ```

## 📝 Fluxo de Uso

1. **Criar Empresa** (via Swagger ou MongoDB)
2. **Criar Usuário ADMIN** (via Swagger)
3. **Login** no front-end
4. **Criar Serviços** (Admin > Serviços)
5. **Criar Usuários BARBEIRO** (via Swagger)
6. **Cadastrar Barbeiros** (Admin > Barbeiros)
7. **Criar Agendamentos** (página Agendar)

## 🔐 Credenciais de Teste

Após criar um usuário, você pode fazer login com:
- Email: o email cadastrado
- Senha: a senha definida

## ⚠️ Observações Importantes

1. **JWT_SECRET**: Altere o JWT_SECRET no `.env` para produção
2. **MongoDB**: Certifique-se de que o MongoDB está acessível
3. **CORS**: Se necessário, configure CORS no `main.ts`
4. **Portas**: Verifique se as portas 3000 (backend) e 3001 (frontend) estão livres

## 🐛 Troubleshooting

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a URI no arquivo `.env`

### Erro 401 (Não autorizado)
- Verifique se o token JWT está sendo enviado
- Confirme que o JWT_SECRET está configurado corretamente

### Erro ao criar agendamento
- Verifique se o serviço e barbeiro pertencem à mesma empresa
- Confirme que não há conflito de horários

## 📚 Documentação da API

Acesse `http://localhost:3000/docs` para ver a documentação completa da API com Swagger.
