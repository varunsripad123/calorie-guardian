import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import Food from '../models/Food.js';
import { OpenAIService } from '../services/openaiService.js';
import { BadRequestError } from '../utils/errorHandler.js';

// Simple logger for tracking API key usage
const logApiKeyUsage = (userId: string, source: string, apiKey: string) => {
  console.log(`OpenAI API request - User ID: ${userId}, Source: ${source}, Using: ${apiKey ? 'User key' : 'Server key'}`);
};

// Helper to get user's API key or fallback to server API key
const getUserApiKey = async (userId: string): Promise<string> => {
  try {
    // First check if user has their own API key
    const user = await User.findById(userId);
    
    if (user && user.apiKey && user.apiKey.trim() !== '') {
      console.log("Using user-provided API key");
      return user.apiKey;
    }
    
    // If not, try to use the server's API key from environment variables
    const serverApiKey = process.env.OPENAI_API_KEY;
    
    if (serverApiKey && serverApiKey.trim() !== '') {
      console.log("Using server API key from environment");
      return serverApiKey;
    }
    
    // If no keys are available, return an empty string - the OpenAIService will attempt to use
    // environment variables directly when creating the OpenAI client
    console.log("No API keys found - will try to use default environment config");
    return '';
    
  } catch (error) {
    console.error("Error fetching API key:", error);
    // Just return empty string and let the OpenAI client try to use the environment
    return '';
  }
};

// @desc    Analyze food item
// @route   POST /api/openai/analyze-food
// @access  Private
export const analyzeFoodItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodDescription } = req.body;
    
    if (!foodDescription) {
      throw new BadRequestError('Food description is required');
    }
    
    // Get user's API key
    const apiKey = await getUserApiKey(req.user._id);
    logApiKeyUsage(req.user._id, 'analyze-food', apiKey);
    
    // Analyze food with OpenAI
    const foodData = await OpenAIService.analyzeFoodItem(foodDescription, apiKey);
    
    res.status(200).json({
      success: true,
      food: {
        name: foodData.name,
        quantity: foodData.quantity,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        aiGenerated: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nutrition advice
// @route   POST /api/openai/nutrition-advice
// @access  Private
export const getNutritionAdvice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.body;
    
    // Get user profile
    const user = await User.findById(req.user._id);
    
    if (!user || !user.profile) {
      throw new BadRequestError('User profile not found. Please update your profile first.');
    }
    
    // Get user's API key or fallback to server key
    const apiKey = await getUserApiKey(req.user._id);
    
    // Get food items for the specified date
    const queryDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const foodItems = await Food.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (foodItems.length === 0) {
      throw new BadRequestError('No food items found for the specified date.');
    }
    
    // Calculate totals
    const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = foodItems.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = foodItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = foodItems.reduce((sum, item) => sum + item.fat, 0);
    
    // Format food items for OpenAI
    const items = foodItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat
    }));
    
    // Get nutrition advice with OpenAI
    const advice = await OpenAIService.getNutritionAdvice(
      {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        items
      },
      {
        name: user.name,
        weight: user.profile.weight,
        height: user.profile.height,
        age: user.profile.age,
        gender: user.profile.gender,
        activityLevel: user.profile.activityLevel,
        goal: user.profile.goal,
        nationality: user.profile.nationality,
        dietaryPreferences: user.profile.dietaryPreferences,
        maintenanceCalories: user.profile.maintenanceCalories,
        targetCalories: user.profile.targetCalories
      },
      apiKey
    );
    
    res.status(200).json({
      success: true,
      advice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate meal plan
// @route   POST /api/openai/meal-plan
// @access  Private
export const generateMealPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mealCount, cuisinePreference, excludedIngredients, userProfile } = req.body;
    
    console.log("Meal plan request received:", { mealCount, cuisinePreference, userProfile: !!userProfile });
    
    // Skip OpenAI for now and return a mock meal plan
    const mockMealPlan = {
      totalCalories: 2000,
      totalProtein: 100,
      totalCarbs: 200,
      totalFat: 70,
      meals: [
        {
          name: "Breakfast Bowl",
          type: "breakfast",
          calories: 450,
          protein: 25,
          carbs: 50,
          fat: 15,
          ingredients: ["Oats", "Greek yogurt", "Berries", "Honey", "Almonds"],
          recipe: "Mix 1/2 cup oats with 3/4 cup Greek yogurt. Top with mixed berries, a drizzle of honey, and a sprinkle of sliced almonds."
        },
        {
          name: "Grilled Chicken Salad",
          type: "lunch",
          calories: 550,
          protein: 40,
          carbs: 30,
          fat: 25,
          ingredients: ["Chicken breast", "Mixed greens", "Cherry tomatoes", "Cucumber", "Olive oil", "Balsamic vinegar"],
          recipe: "Grill 5oz chicken breast. Serve over mixed greens with sliced cucumber and cherry tomatoes. Dress with olive oil and balsamic vinegar."
        },
        {
          name: "Salmon with Roasted Vegetables",
          type: "dinner",
          calories: 650,
          protein: 35,
          carbs: 40,
          fat: 30,
          ingredients: ["Salmon fillet", "Broccoli", "Bell peppers", "Zucchini", "Olive oil", "Lemon", "Herbs"],
          recipe: "Roast mixed vegetables with olive oil at 400°F for 20 minutes. Pan-sear salmon fillet and serve with a squeeze of lemon."
        },
        {
          name: "Greek Yogurt with Berries",
          type: "snack",
          calories: 200,
          protein: 15,
          carbs: 20,
          fat: 5,
          ingredients: ["Greek yogurt", "Mixed berries", "Honey"],
          recipe: "Mix 3/4 cup Greek yogurt with mixed berries and a drizzle of honey."
        }
      ].slice(0, mealCount || 3)
    };
    
    // Adjust totals based on number of meals
    if (mockMealPlan.meals.length < 4) {
      const ratio = mockMealPlan.meals.length / 4;
      mockMealPlan.totalCalories = Math.round(mockMealPlan.totalCalories * ratio);
      mockMealPlan.totalProtein = Math.round(mockMealPlan.totalProtein * ratio);
      mockMealPlan.totalCarbs = Math.round(mockMealPlan.totalCarbs * ratio);
      mockMealPlan.totalFat = Math.round(mockMealPlan.totalFat * ratio);
    }
    
    // Success response with mock data
    res.status(200).json({
      success: true,
      mealPlan: mockMealPlan
    });
    
  } catch (error) {
    console.error("Error in meal plan generation:", error);
    // Send a helpful error response
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: 'There was an issue generating your meal plan. Please check your profile is complete.'
      }
    });
  }
};

// @desc    Get coaching advice
// @route   POST /api/openai/coaching
// @access  Private
export const getProgressReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userProfile } = req.body;
    
    console.log("Progress review request received:", { userProfile: !!userProfile });
    
    // Create a mock weekly review
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 7);
    
    const periodString = `${startDate.toLocaleDateString()} to ${today.toLocaleDateString()}`;
    
    const mockReview = {
      summary: {
        period: periodString,
        daysTracked: 5,
        avgCalories: 1800,
        avgProtein: 90,
        calorieAdherence: "90%",
        targetCalories: 2000
      },
      insights: [
        {
          title: "Good Protein Intake",
          content: "You've consistently met your protein targets on most days, which is excellent for muscle maintenance and recovery. Keep focusing on quality protein sources with each meal.",
          type: "success"
        },
        {
          title: "Inconsistent Tracking",
          content: "You tracked 5 out of 7 days this week. More consistent tracking will give you better insights into your nutrition patterns and help you make more informed adjustments.",
          type: "warning"
        },
        {
          title: "Calorie Distribution",
          content: "Your calorie intake tends to be higher in the evening. Consider balancing your meals throughout the day for more sustained energy and potentially better results.",
          type: "info"
        }
      ],
      nextWeekFocus: {
        title: "Increase Tracking Consistency",
        content: "For next week, aim to track all 7 days, including weekends. This will give you a complete picture of your nutrition habits and help identify any patterns that may be affecting your progress.",
        type: "primary"
      }
    };
    
    // Send the mock review
    res.status(200).json({
      success: true,
      weeklyReview: mockReview
    });
    
  } catch (error) {
    console.error("Error in progress review:", error);
    // Send a helpful error response
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: 'There was an issue generating your progress review. Please try again later.'
      }
    });
  }
};

export const getCoachingAdvice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, userProfile } = req.body;
    
    console.log("Coaching advice request received:", { topic, userProfile: !!userProfile });
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Topic is required'
        }
      });
    }
    
    // Create mock coaching advice based on topic
    let mockAdvice: any = {
      title: "",
      content: "",
      actionItems: [],
      type: "info"
    };
    
    // Different advice based on topic
    switch(topic) {
      case 'general':
        mockAdvice = {
          title: "Personalized Nutrition Guidance",
          content: "Based on your profile and goals, focusing on whole foods and a balanced diet will help you reach your targets. A combination of lean proteins, complex carbohydrates, and healthy fats will provide sustained energy and support your fitness goals. Try to include a variety of colorful fruits and vegetables to ensure you're getting a wide range of micronutrients.",
          actionItems: [
            "Include protein with every meal (aim for 25-30g per meal)",
            "Add at least 2 servings of vegetables to lunch and dinner",
            "Stay hydrated by drinking at least 2-3 liters of water daily",
            "Limit processed foods and added sugars",
            "Plan your meals ahead to avoid impulsive food choices"
          ],
          type: "info"
        };
        break;
        
      case 'portion-control':
        mockAdvice = {
          title: "Master Your Portion Sizes",
          content: "For your weight management goals, portion control is critical. Using visual cues can help - your protein should be about the size of your palm, carbohydrates the size of your cupped hand, and fats about the size of your thumb. This approach allows flexibility while maintaining control over your calorie intake without constant measuring.",
          actionItems: [
            "Use smaller plates to naturally reduce portion sizes",
            "Measure food portions for a week to calibrate your visual judgment",
            "Wait 20 minutes before taking seconds to recognize fullness cues",
            "Pre-portion snacks rather than eating from large containers",
            "Include fiber-rich foods that promote satiety with smaller portions"
          ],
          type: "success"
        };
        break;
        
      case 'mindful-eating':
        mockAdvice = {
          title: "Developing Mindful Eating Habits",
          content: "Mindful eating can transform your relationship with food. By paying full attention to the experience of eating, you'll be more aware of hunger and fullness cues, potentially reducing overeating. This practice involves eating slowly, savoring each bite, and acknowledging physical hunger versus emotional cravings.",
          actionItems: [
            "Eat without distractions (no TV, phone, or computer)",
            "Chew each bite thoroughly before taking another",
            "Check in with your hunger levels before, during, and after meals",
            "Use all five senses to appreciate your food",
            "Keep a mindful eating journal for one week"
          ],
          type: "info"
        };
        break;
        
      case 'macro-balance':
        mockAdvice = {
          title: "Optimizing Your Macronutrient Balance",
          content: "For your specific goals and activity level, a balanced macronutrient approach will serve you well. Aim for approximately 30% of calories from protein, 40% from carbohydrates, and 30% from healthy fats. This balance will support your workouts while providing sustained energy throughout the day and promoting recovery.",
          actionItems: [
            "Track your macros for a few days to establish a baseline",
            "Aim for 1.6-2g of protein per kg of body weight",
            "Focus on complex carbs around your workout times",
            "Include healthy fats like avocados, nuts, and olive oil daily",
            "Adjust your carbohydrate intake based on activity level each day"
          ],
          type: "info"
        };
        break;
        
      default:
        mockAdvice = {
          title: "Customized Nutrition Strategy",
          content: "A personalized approach to nutrition is essential for long-term success. Based on your profile, focusing on nutrient-dense whole foods while maintaining a sustainable eating pattern will help you achieve your goals. Remember that consistency is more important than perfection.",
          actionItems: [
            "Start a food journal to identify patterns and areas for improvement",
            "Establish a regular meal schedule to maintain energy levels",
            "Include protein with every meal",
            "Stay hydrated throughout the day",
            "Allow yourself planned treats to maintain sustainability"
          ],
          type: "info"
        };
    }
    
    // Send the mock advice
    res.status(200).json({
      success: true,
      coaching: mockAdvice
    });
    
  } catch (error) {
    console.error("Error in coaching advice:", error);
    // Send a helpful error response
    res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: 'There was an issue generating your coaching advice. Please try again later.'
      }
    });
  }
};

// @desc    Generate recipe
// @route   POST /api/openai/recipe
// @access  Private
export const generateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ingredients, cuisineType, dietaryRestrictions, difficulty, timeLimit } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      throw new BadRequestError('Ingredients are required');
    }
    
    // Get user's API key
    const apiKey = await getUserApiKey(req.user._id);
    
    // Generate recipe with OpenAI
    const recipe = await OpenAIService.generateRecipe(
      ingredients,
      {
        cuisineType,
        dietaryRestrictions,
        difficulty,
        timeLimit
      },
      apiKey
    );
    
    res.status(200).json({
      success: true,
      recipe
    });
  } catch (error) {
    next(error);
  }
};