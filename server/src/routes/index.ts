import express from 'express';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import foodRoutes from './foodRoutes.js';
import openaiRoutes from './openaiRoutes.js';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/food', foodRoutes);
router.use('/openai', openaiRoutes);

export default router;