require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const User = require('./models/User'); // Importe os modelos para sincronização
const Asset = require('./models/Asset'); // Importe os modelos para sincronização
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173', // AQUI! Permite requisições APENAS do seu frontend Vite
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
    credentials: true, // Permite que cookies e cabeçalhos de autenticação sejam enviados
    optionsSuccessStatus: 204 // Para requisições preflight bem-sucedidas
};
app.use(cors(corsOptions)); // Aplica o middleware CORS com as opções

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('API do Gerenciador de Ativos está rodando!');
});

// Sincronizar modelos com o banco de dados e iniciar o servidor
sequelize.sync({ force: false }) // 'force: true' apaga e recria tabelas (use com cautela!)
  .then(() => {
    console.log('Banco de dados sincronizado.');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao sincronizar banco de dados:', err);
  });