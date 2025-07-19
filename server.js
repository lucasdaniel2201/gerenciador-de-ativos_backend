import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis de ambiente do .env

import express from 'express';
import sequelize from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import usersRouter from './routes/usersRouter.js'
import cors from 'cors';

const app = express();
const PORT = process.env.PORT;

// Middleware para parsear JSON
app.use(express.json());

// Configuração CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Permite requisições APENAS do seu frontend Vite
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRouter)
app.use('/api/assets', assetRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Gerenciador de Ativos está rodando!');
});

// Sincronizar banco de dados e iniciar servidor
sequelize.sync({ force: false })
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
