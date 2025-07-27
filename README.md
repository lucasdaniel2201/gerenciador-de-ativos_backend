# Sistema de Gerenciamento de Ativos

## Visão Geral

Sistema completo de gerenciamento de ativos com modelo de negócio freemium, autenticação JWT e integração com Stripe para pagamentos. Permite que usuários cadastrem, gerenciem e controlem ativos de forma organizada.

## Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL com Sequelize ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Pagamentos**: Stripe API
- **Segurança**: bcryptjs para hash de senhas
- **CORS**: Configurado para frontend localhost:5173

## Estrutura do Projeto

```
backend/
├── config/
│   └── database.js          # Configuração do Sequelize/PostgreSQL
├── controllers/
│   ├── assetController.js   # Lógica de negócio dos ativos
│   └── authController.js    # Lógica de autenticação
├── middleware/
│   └── auth.js             # Middleware de autenticação JWT
├── models/
│   ├── Asset.js            # Model do ativo
│   └── User.js             # Model do usuário
├── routes/
│   ├── assetRoutes.js      # Rotas dos ativos
│   ├── authRoutes.js       # Rotas de auth
│   ├── checkoutRoute.js    # Checkout Stripe
│   ├── webhookRoutes.js    # Webhooks Stripe
│   ├── subscriptionCancelRoute.js
│   ├── subscriptionUpdateRoute.js
│   ├── userSubscriptionRoutes.js
│   └── usersRouter.js      # Listagem de usuários
├── migrate.js              # Script de migração do banco
├── server.js              # Arquivo principal do servidor
└── package.json
```

## Configuração do Ambiente

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_REGISTER_WEBHOOK_SECRET=whsec_...
STRIPE_UPDATE_WEBHOOK_SECRET=whsec_...

# Limites Freemium
FREE_USER_LIMIT=100
FREE_ASSET_LIMIT=10

# Ambiente
NODE_ENV=development
PORT=3000
```

### Instalação

```bash
# Instalar dependências
npm install

# Executar migrações
npm run migrate

# Executar em desenvolvimento
npm run dev
```

## Modelos de Dados

### User (Usuário)

```javascript
{
  id: INTEGER (PK, Auto Increment),
  username: STRING (Unique, Required),
  email: STRING (Unique, Required, Email),
  password: STRING (Required, Hash),
  isPremium: BOOLEAN (Default: false),
  stripeCustomerId: STRING (Nullable),
  stripeSubscriptionId: STRING (Nullable),
  subscriptionStatus: STRING (Nullable),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Asset (Ativo)

```javascript
{
  id: INTEGER (PK, Auto Increment),
  name: STRING (Required),
  serialNumber: STRING (Unique, Required),
  responsible: STRING (Nullable),
  assignmentDate: DATE (Default: NOW),
  condition: STRING (Nullable),
  notes: TEXT (Nullable),
  userId: INTEGER (FK to User, Required),
  createdAt: DATE,
  updatedAt: DATE
}
```

## API Endpoints

### Autenticação

#### POST `/api/auth/register`
Registra um novo usuário (com verificação de limite freemium).

**Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "isPremium": boolean (opcional),
  "stripeCustomerId": "string" (opcional),
  "stripeSubscriptionId": "string" (opcional)
}
```

**Response:**
```json
{
  "message": "Usuário registrado com sucesso!",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "email@exemplo.com",
    "isPremium": false
  },
  "token": "jwt_token"
}
```

#### POST `/api/auth/login`
Realiza login do usuário.

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso!",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "email@exemplo.com",
    "isPremium": false
  },
  "token": "jwt_token"
}
```

### Ativos (Requer Autenticação)

#### POST `/api/assets`
Cria um novo ativo (com verificação de limite freemium).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "name": "string",
  "serialNumber": "string",
  "responsible": "string" (opcional),
  "condition": "string" (opcional),
  "notes": "string" (opcional)
}
```

#### GET `/api/assets`
Lista todos os ativos do usuário autenticado.

**Headers:**
```
Authorization: Bearer jwt_token
```

#### GET `/api/assets/:id`
Busca um ativo específico por ID.

#### PUT `/api/assets/:id`
Atualiza um ativo existente.

#### DELETE `/api/assets/:id`
Exclui um ativo.

### Pagamentos e Assinaturas

#### POST `/api/checkout/create-checkout-session`
Cria sessão de checkout do Stripe para upgrade premium.

#### POST `/api/subscription/cancel-subscription`
Cancela assinatura premium do usuário.

#### GET `/api/subscription/user/subscription`
Busca informações da assinatura do usuário.

### Webhooks

#### POST `/webhook`
Webhook para processar eventos de registro via Stripe.

#### POST `/webhook/stripe`
Webhook para atualizar status de assinaturas.

## Funcionalidades Principais

### 1. Sistema Freemium
- **Usuários Gratuitos**: Limitados a criar um número específico de ativos
- **Usuários Premium**: Acesso a um limite maior de criação de ativos
- Verificação automática de limites antes de operações

### 2. Autenticação e Segurança
- Autenticação via JWT com expiração de 1 hora
- Senhas criptografadas com bcryptjs
- Middleware de proteção para rotas sensíveis
- Validação de propriedade (usuários só acessam seus próprios ativos)

### 3. Integração com Stripe
- Checkout para upgrade premium
- Webhooks para sincronização automática de status
- Cancelamento de assinaturas
- Controle de status de pagamentos

### 4. Gestão de Ativos
- CRUD completo de ativos
- Campos personalizáveis (condição, responsável, notas)
- Histórico automático de datas
- Números de série únicos

## Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Executar migrações do banco
npm run migrate
```

## Middleware de Autenticação

O sistema utiliza o middleware `protect` que:
1. Verifica presença do token JWT no header Authorization
2. Valida a assinatura do token
3. Anexa informações do usuário à requisição
4. Permite acesso apenas a usuários autenticados

## Tratamento de Erros

O sistema inclui tratamento abrangente de erros:
- Validação de dados de entrada
- Tratamento de erros de banco de dados
- Respostas padronizadas com códigos HTTP apropriados
- Logs detalhados para debugging

## Considerações de Segurança

1. **Senhas**: Hash com bcryptjs e salt
2. **JWT**: Tokens com expiração configurável
3. **CORS**: Configurado especificamente para o frontend
4. **Validação**: Verificação de propriedade de recursos
5. **Webhooks**: Verificação de assinatura do Stripe
