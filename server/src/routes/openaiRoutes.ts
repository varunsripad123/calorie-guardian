import express from 'express';
import { 
  analyzeFoodItem, 
  getNutritionAdvice, 
  generateMealPlan, 
  generateRecipe, 
  getCoachingAdvice,
  getProgressReview
} from '../controllers/openaiController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/analyze-food', analyzeFoodItem);
router.post('/nutrition-advice', getNutritionAdvice);
router.post('/meal-plan', generateMealPlan);
router.post('/recipe', generateRecipe);
router.post('/coaching', getCoachingAdvice);
router.post('/progress-review', getProgressReview);

export default router;