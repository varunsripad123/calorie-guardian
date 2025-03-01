
import { DailyNutrition, FoodItem, UserProfile } from "@/types";

// Calculate maintenance calories using the Mifflin-St Jeor Equation
export const calculateMaintenanceCalories = (profile: Omit<UserProfile, 'maintenanceCalories' | 'targetCalories'>): number => {
  const { weight, height, age, gender, activityLevel } = profile;
  
  // Base BMR calculation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity multiplier
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very active': 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

// Calculate target calories based on goal
export const calculateTargetCalories = (maintenanceCalories: number, goal: UserProfile['goal']): number => {
  switch (goal) {
    case 'lose':
      return Math.round(maintenanceCalories * 0.8);
    case 'gain':
      return Math.round(maintenanceCalories * 1.15);
    case 'maintain':
    default:
      return maintenanceCalories;
  }
};

// Format a date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get today's date formatted as YYYY-MM-DD
export const getTodayFormatted = (): string => {
  return formatDate(new Date());
};

// Initialize empty daily nutrition
export const initializeDailyNutrition = (): DailyNutrition => {
  return {
    date: getTodayFormatted(),
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    items: []
  };
};

// Add food item to daily nutrition and recalculate totals
export const addFoodItem = (nutrition: DailyNutrition, item: FoodItem): DailyNutrition => {
  const updatedItems = [...nutrition.items, item];
  
  // Recalculate totals
  const totals = updatedItems.reduce((acc, curr) => {
    return {
      totalCalories: acc.totalCalories + curr.calories,
      totalProtein: acc.totalProtein + (curr.protein || 0),
      totalCarbs: acc.totalCarbs + (curr.carbs || 0),
      totalFat: acc.totalFat + (curr.fat || 0)
    };
  }, {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });
  
  return {
    ...nutrition,
    ...totals,
    items: updatedItems
  };
};

// Remove food item from daily nutrition and recalculate totals
export const removeFoodItem = (nutrition: DailyNutrition, itemId: string): DailyNutrition => {
  const updatedItems = nutrition.items.filter(item => item.id !== itemId);
  
  // Recalculate totals
  const totals = updatedItems.reduce((acc, curr) => {
    return {
      totalCalories: acc.totalCalories + curr.calories,
      totalProtein: acc.totalProtein + (curr.protein || 0),
      totalCarbs: acc.totalCarbs + (curr.carbs || 0),
      totalFat: acc.totalFat + (curr.fat || 0)
    };
  }, {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });
  
  return {
    ...nutrition,
    ...totals,
    items: updatedItems
  };
};

// Generate a prompt for the Gemini API to analyze a food item
export const generateFoodAnalysisPrompt = (foodDescription: string): string => {
  return `
    Analyze the following food item and provide nutritional information:
    Food: ${foodDescription}
    
    Please provide the following information in JSON format:
    - name: The name of the food
    - quantity: The quantity or portion size
    - calories: Estimated calories
    - protein: Estimated protein in grams
    - carbs: Estimated carbohydrates in grams
    - fat: Estimated fat in grams
    
    Format your response as valid JSON without any additional text:
    {
      "name": "Food name",
      "quantity": "portion",
      "calories": 123,
      "protein": 12,
      "carbs": 34,
      "fat": 5
    }
  `;
};

// Generate a nutrition advice prompt for the Gemini API
export const generateNutritionAdvicePrompt = (
  nutrition: DailyNutrition, 
  profile: UserProfile
): string => {
  const calorieStatus = nutrition.totalCalories >= profile.targetCalories ? 'over' : 'under';
  const caloriePercentage = Math.round((nutrition.totalCalories / profile.targetCalories) * 100);
  
  return `
    I need nutritional advice for a person with the following profile:
    - Goal: ${profile.goal === 'lose' ? 'lose weight' : profile.goal === 'gain' ? 'gain weight' : 'maintain weight'}
    - Target daily calories: ${profile.targetCalories} calories
    - Maintenance calories: ${profile.maintenanceCalories} calories
    
    Today's nutrition so far:
    - Total calories consumed: ${nutrition.totalCalories} calories (${caloriePercentage}% of target)
    - Protein: ${nutrition.totalProtein}g
    - Carbs: ${nutrition.totalCarbs}g
    - Fat: ${nutrition.totalFat}g
    
    Based on this information, provide a short, friendly nutrition advice. Use a conversational tone like a supportive personal nutrition coach. Keep it to 2-3 sentences max. Don't use bullet points.
  `;
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
