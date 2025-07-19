import express from 'express';
import * as assetController from '../controllers/assetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Rota para criar um ativo (protegida e com checagem de limite freemium)
router.post('/', protect, assetController.checkAssetLimit, assetController.createAsset);

// Rotas para listar, buscar por ID, atualizar e deletar ativos (protegidas)
router.get('/', protect, assetController.getAssets);
router.get('/:id', protect, assetController.getAssetById);
router.put('/:id', protect, assetController.updateAsset);
router.delete('/:id', protect, assetController.deleteAsset);

export default router;
