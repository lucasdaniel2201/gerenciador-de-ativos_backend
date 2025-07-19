import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const FREE_USER_LIMIT = process.env.FREE_USER_LIMIT;

// Função auxiliar para gerar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verificar limite Freemium para novos usuários
    const userCount = await User.count();
    if (userCount >= parseInt(FREE_USER_LIMIT) && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: `Limite de ${FREE_USER_LIMIT} usuários gratuitos atingido. Considere um plano premium.` });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Nome de usuário já existe.' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }

    const newUser = await User.create({ username, email, password });
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isPremium: newUser.isPremium
      },
      token
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.', error: error.message });
  }
};


export const login = async (req, res) => {
  const { username, password } = await req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium
      },
      token
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer login.', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // evita retornar senhas
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};
