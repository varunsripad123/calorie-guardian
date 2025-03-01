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

// Generate nutrition advice prompt for the Gemini API with nationality and food preferences
export function generateNutritionAdvicePrompt(dailyNutrition: DailyNutrition, userProfile: UserProfile): string {
  // Calculate what percentage of daily target has been consumed
  const caloriePercentage = (dailyNutrition.totalCalories / userProfile.targetCalories) * 100;
  const proteinPercentage = (dailyNutrition.totalProtein / (userProfile.weight * 1.6)) * 100; // Using 1.6g per kg as reference
  const carbsPercentage = (dailyNutrition.totalCarbs / (userProfile.targetCalories * 0.45 / 4)) * 100; // 45% of calories from carbs
  const fatPercentage = (dailyNutrition.totalFat / (userProfile.targetCalories * 0.3 / 9)) * 100; // 30% of calories from fat

  // Create a detailed food log
  const foodLog = dailyNutrition.items.map(item => 
    `${item.name} (${item.quantity}): ${item.calories} calories, Protein: ${item.protein || 0}g, Carbs: ${item.carbs || 0}g, Fat: ${item.fat || 0}g`
  ).join('\n');

  return `
You are a professional nutritionist giving personalized advice to a client. 
Be friendly, helpful and to-the-point (2-3 short paragraphs maximum).

CLIENT PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Weight: ${userProfile.weight} kg
- Height: ${userProfile.height} cm
- Activity Level: ${userProfile.activityLevel}
- Goal: ${userProfile.goal === 'lose' ? 'Weight Loss' : userProfile.goal === 'gain' ? 'Weight Gain' : 'Weight Maintenance'}
- Nationality/Background: ${userProfile.nationality}
- Dietary Preferences: ${userProfile.dietaryPreferences.join(', ')}
- Maintenance Calories: ${userProfile.maintenanceCalories} calories/day
- Target Calories: ${userProfile.targetCalories} calories/day

DAILY NUTRITION SO FAR:
- Total Calories: ${dailyNutrition.totalCalories} (${caloriePercentage.toFixed(1)}% of daily target)
- Total Protein: ${dailyNutrition.totalProtein}g (${proteinPercentage.toFixed(1)}% of recommended)
- Total Carbs: ${dailyNutrition.totalCarbs}g (${carbsPercentage.toFixed(1)}% of recommended)
- Total Fat: ${dailyNutrition.totalFat}g (${fatPercentage.toFixed(1)}% of recommended)

FOOD LOG:
${foodLog}

Based on this information, provide personalized nutrition advice for the client. Consider:
1. Whether they are on track with their calories based on their goal (weight loss, gain, or maintenance)
2. The balance of macronutrients (protein, carbs, fat) and any adjustments needed
3. Suggestions for future meals based on their dietary preferences and nationality
4. Any potential nutritional gaps or concerns
5. Positive reinforcement for good choices they've made

If they've consumed less than 25% of their target calories, focus on meal planning suggestions.
If they've consumed 25-90% of their target calories, offer balanced advice on completing their day.
If they've consumed 90-110% of their target calories, provide positive reinforcement and minor adjustments.
If they've exceeded 110% of their target calories, offer supportive guidance on managing the situation.
`;
}

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

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
