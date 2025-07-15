const Asset = require('../models/Asset');
const User = require('../models/User'); // Para verificar se é premium
const { FREE_ASSET_LIMIT } = process.env;

// Middleware para verificar o limite Freemium antes de criar um ativo
const checkAssetLimit = async (req, res, next) => {
  const userId = req.user.id; // Assume que o ID do usuário está em req.user.id (do middleware de auth)
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (!user.isPremium) {
      const assetCount = await Asset.count({ where: { userId: userId } });
      if (assetCount >= parseInt(FREE_ASSET_LIMIT)) {
        return res.status(403).json({ message: `Limite de ${FREE_ASSET_LIMIT} ativos atingido para usuários gratuitos. Considere um plano premium.` });
      }
    }
    next(); // Permite que a requisição continue
  } catch (error) {
    console.error('Erro ao verificar limite de ativos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao verificar limite de ativos.' });
  }
};


exports.createAsset = async (req, res) => {
  const { name, serialNumber, responsible, condition, notes } = req.body;
  const userId = req.user.id; // ID do usuário que vem do token JWT

  if (!name || !serialNumber) {
    return res.status(400).json({ message: 'Nome e Número de Série são obrigatórios.' });
  }

  try {
    const newAsset = await Asset.create({
      name,
      serialNumber,
      responsible,
      condition,
      notes,
      userId // Associa o ativo ao usuário logado
    });
    res.status(201).json({ message: 'Ativo criado com sucesso!', asset: newAsset });
  } catch (error) {
    console.error('Erro ao criar ativo:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Número de série já existe.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar ativo.', error: error.message });
  }
};

exports.getAssets = async (req, res) => {
  const userId = req.user.id; // ID do usuário que vem do token JWT
  try {
    const assets = await Asset.findAll({
      where: { userId: userId }, // Filtra os ativos pelo usuário logado
      order: [['assignmentDate', 'DESC']] // Ordena pelos mais recentes
    });
    res.status(200).json(assets);
  } catch (error) {
    console.error('Erro ao buscar ativos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar ativos.', error: error.message });
  }
};

exports.getAssetById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const asset = await Asset.findOne({
      where: { id: id, userId: userId } // Garante que o usuário só acesse seus próprios ativos
    });

    if (!asset) {
      return res.status(404).json({ message: 'Ativo não encontrado ou você não tem permissão para acessá-lo.' });
    }
    res.status(200).json(asset);
  } catch (error) {
    console.error('Erro ao buscar ativo por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar ativo.' });
  }
};

exports.updateAsset = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, serialNumber, responsible, condition, notes } = req.body;

  try {
    const asset = await Asset.findOne({
      where: { id: id, userId: userId }
    });

    if (!asset) {
      return res.status(404).json({ message: 'Ativo não encontrado ou você não tem permissão para atualizá-lo.' });
    }

    // Atualiza apenas os campos enviados no corpo da requisição
    asset.name = name || asset.name;
    asset.serialNumber = serialNumber || asset.serialNumber;
    asset.responsible = responsible || asset.responsible;
    asset.condition = condition || asset.condition;
    asset.notes = notes || asset.notes;

    await asset.save();
    res.status(200).json({ message: 'Ativo atualizado com sucesso!', asset });
  } catch (error) {
    console.error('Erro ao atualizar ativo:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Número de série já existe para outro ativo.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar ativo.', error: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const asset = await Asset.findOne({
      where: { id: id, userId: userId }
    });

    if (!asset) {
      return res.status(404).json({ message: 'Ativo não encontrado ou você não tem permissão para excluí-lo.' });
    }

    await asset.destroy();
    res.status(200).json({ message: 'Ativo excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir ativo:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao excluir ativo.' });
  }
};

// Exporte o middleware também
exports.checkAssetLimit = checkAssetLimit;