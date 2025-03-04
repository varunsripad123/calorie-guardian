import express from 'express';
import { registerUser, loginUser, getCurrentUser, saveApiKey } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/apikey', protect, saveApiKey);

export default router;