const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth'); // Middleware de proteção

// Rota para criar um ativo (protegida e com checagem de limite freemium)
router.post('/', protect, assetController.checkAssetLimit, assetController.createAsset);
// Rotas para listar, buscar por ID, atualizar e deletar ativos (protegidas)
router.get('/', protect, assetController.getAssets);
router.get('/:id', protect, assetController.getAssetById);
router.put('/:id', protect, assetController.updateAsset);
router.delete('/:id', protect, assetController.deleteAsset);

module.exports = router;