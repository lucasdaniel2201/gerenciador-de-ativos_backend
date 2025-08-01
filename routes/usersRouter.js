import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.get('/users', authController.getAllUsers);

export default router