import express from 'express';
import { addFoodItem, getFoodItems, deleteFoodItem, getNutritionSummary } from '../controllers/foodController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', addFoodItem);
router.get('/', getFoodItems);
router.delete('/:id', deleteFoodItem);
router.get('/summary', getNutritionSummary);

export default router;