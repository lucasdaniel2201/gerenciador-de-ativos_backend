import Asset from '../models/Asset.js';
import User from '../models/User.js';

// Limite de ativos gratuitos
const FREE_ASSET_LIMIT = process.env.FREE_ASSET_LIMIT;

// Middleware para verificar o limite Freemium antes de criar um ativo
export const checkAssetLimit = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    if (!user.isPremium) {
      const assetCount = await Asset.count({ where: { userId } });
      if (assetCount >= parseInt(FREE_ASSET_LIMIT)) {
        return res.status(403).json({
          message: `Limite de ${FREE_ASSET_LIMIT} ativos atingido para usuários gratuitos. Considere um plano premium.`
        });
      }
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de ativos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao verificar limite de ativos.' });
  }
};

// Criar ativo
export const createAsset = async (req, res) => {
  const { name, serialNumber, responsible, condition, notes } = req.body;
  const userId = req.user.id;

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
      userId
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

// Listar ativos
export const getAssets = async (req, res) => {
  const userId = req.user.id;

  try {
    const assets = await Asset.findAll({
      where: { userId },
      order: [['assignmentDate', 'DESC']]
    });

    res.status(200).json(assets);
  } catch (error) {
    console.error('Erro ao buscar ativos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar ativos.', error: error.message });
  }
};

// Buscar ativo por ID
export const getAssetById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const asset = await Asset.findOne({
      where: { id, userId }
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

// Atualizar ativo
export const updateAsset = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, serialNumber, responsible, condition, notes } = req.body;

  try {
    const asset = await Asset.findOne({
      where: { id, userId }
    });

    if (!asset) {
      return res.status(404).json({ message: 'Ativo não encontrado ou você não tem permissão para atualizá-lo.' });
    }

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

// Excluir ativo
export const deleteAsset = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const asset = await Asset.findOne({
      where: { id, userId }
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
