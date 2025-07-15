const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obter token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Anexar usuário à requisição
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

      if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado, token inválido.' });
      }

      next();
    } catch (error) {
      console.error('Erro de autenticação:', error);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, sem token.' });
  }
};

module.exports = { protect };