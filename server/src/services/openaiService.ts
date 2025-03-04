import OpenAI from 'openai';
import { BadRequestError } from '../utils/errorHandler.js';

// Use a specific model that is widely available across all OpenAI accounts
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Simple log function to enable consistent, detailed logging
const log = (message: string, level: 'info'|'warn'|'error' = 'info', context?: any) => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
  
  if (level === 'error') {
    console.error(`[${timestamp}] 🔴 ERROR: ${message}${contextStr}`);
  } else if (level === 'warn') {
    console.warn(`[${timestamp}] 🟠 WARNING: ${message}${contextStr}`);
  } else {
    console.log(`[${timestamp}] 🟢 INFO: ${message}${contextStr}`);
  }
};

// Food analysis prompt template
const generateFoodAnalysisPrompt = (foodDescription: string): string => {
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

// Nutrition advice prompt template
const generateNutritionAdvicePrompt = (
  dailyNutrition: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    items: Array<{
      name: string;
      quantity: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  },
  userProfile: {
    name: string;
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    goal: string;
    nationality: string;
    dietaryPreferences: string[];
    maintenanceCalories: number;
    targetCalories: number;
  }
): string => {
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
};

// OpenAI API Service
export class OpenAIService {
  
  // Create a new OpenAI instance with the user's API key
  static createOpenAI(apiKey: string): OpenAI {
    // Log the key format for debugging (without revealing the full key)
    if (apiKey) {
      console.log(`API key format: ${apiKey.substring(0, 5)}... (${apiKey.length} chars)`);
    } else {
      console.log("No API key provided");
    }
    
    // Attempt to create the client regardless of key format
    try {
      // Create the OpenAI client with the provided key
      console.log("Attempting to create OpenAI client");
      
      // If creating with a specific key
      if (apiKey && apiKey.trim() !== '') {
        return new OpenAI({
          apiKey: apiKey
        });
      } 
      
      // If no key provided, try to use environment variable
      console.log("Falling back to default OpenAI client (using OPENAI_API_KEY env var)");
      return new OpenAI();
      
    } catch (error) {
      console.error("Error creating OpenAI client:", error);
      
      // Try one more time with default client
      try {
        console.log("Attempting to create default OpenAI client as fallback");
        return new OpenAI();
      } catch (fallbackError) {
        console.error("Failed to create even default OpenAI client:", fallbackError);
        throw new BadRequestError('Failed to initialize OpenAI client. API service may be unavailable.');
      }
    }
  }
  
  // Analyze food using OpenAI
  static async analyzeFoodItem(
    foodDescription: string,
    apiKey: string
  ): Promise<{
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }> {
    try {
      const openai = OpenAIService.createOpenAI(apiKey);
      const prompt = generateFoodAnalysisPrompt(foodDescription);
      
      console.log("Sending request to OpenAI for food analysis");
      let response;
      try {
        // Try with the model specified in DEFAULT_MODEL
        try {
          response = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
              {
                role: 'system',
                content: 'You are a nutrition expert that analyzes food items and provides accurate nutrition information in JSON format.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 500
          });
          console.log("OpenAI response received successfully using specified model");
        } catch (modelError) {
          // If the specified model fails, try with a different model
          console.warn(`Model ${DEFAULT_MODEL} failed, trying fallback model:`, modelError.message);
          
          response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Fallback to a common model
            messages: [
              {
                role: 'system',
                content: 'You are a nutrition expert that analyzes food items and provides accurate nutrition information in JSON format.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 500
          });
          console.log("OpenAI response received successfully using fallback model");
        }
      } catch (error) {
        console.error("OpenAI API request failed (all models):", error);
        throw new BadRequestError(`OpenAI API error: ${error.message || 'Unknown error'}`);
      }
      
      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new BadRequestError('Failed to analyze food item');
      }
      
      // Parse the JSON from the response
      // First, we need to clean the response in case it includes markdown code blocks
      const jsonString = result.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString);
    } catch (error: any) {
      if (error.name === 'BadRequestError') {
        throw error;
      }
      
      console.error('OpenAI API Error:', error);
      throw new BadRequestError('Failed to analyze food item. Please check your API key or try again later.');
    }
  }
  
  // Get nutrition advice using OpenAI
  static async getNutritionAdvice(
    dailyNutrition: {
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      items: Array<{
        name: string;
        quantity: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }>;
    },
    userProfile: {
      name: string;
      weight: number;
      height: number;
      age: number;
      gender: string;
      activityLevel: string;
      goal: string;
      nationality: string;
      dietaryPreferences: string[];
      maintenanceCalories: number;
      targetCalories: number;
    },
    apiKey: string
  ): Promise<{ message: string; type: 'info' | 'warning' | 'success' | 'error' }> {
    try {
      const openai = OpenAIService.createOpenAI(apiKey);
      const prompt = generateNutritionAdvicePrompt(dailyNutrition, userProfile);
      
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist giving personalized advice to a client.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new BadRequestError('Failed to get nutrition advice');
      }
      
      // Determine advice type based on content
      let type: 'info' | 'warning' | 'success' | 'error' = 'info';
      if (result.toLowerCase().includes('warning') || result.toLowerCase().includes('caution')) {
        type = 'warning';
      } else if (result.toLowerCase().includes('excellent') || result.toLowerCase().includes('great job')) {
        type = 'success';
      } else if (result.toLowerCase().includes('error') || result.toLowerCase().includes('problem')) {
        type = 'error';
      }
      
      return { message: result, type };
    } catch (error: any) {
      if (error.name === 'BadRequestError') {
        throw error;
      }
      
      console.error('OpenAI API Error:', error);
      throw new BadRequestError('Failed to get nutrition advice. Please check your API key or try again later.');
    }
  }
  
  // Generate meal plans based on user's preferences and goals
  static async generateMealPlan(
    userProfile: {
      name: string;
      weight: number;
      height: number;
      age: number;
      gender: string;
      activityLevel: string;
      goal: string;
      nationality: string;
      dietaryPreferences: string[];
      maintenanceCalories: number;
      targetCalories: number;
    },
    mealPreferences: {
      mealCount: number;
      cuisinePreference?: string;
      excludedIngredients?: string[];
    },
    apiKey: string
  ): Promise<{
    dailyPlan: {
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      meals: Array<{
        name: string;
        type: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        ingredients: string[];
        recipe?: string;
      }>;
    };
  }> {
    try {
      const openai = OpenAIService.createOpenAI(apiKey);
      const prompt = `
Create a personalized meal plan for a client with the following profile:

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
- Target Calories: ${userProfile.targetCalories} calories/day

MEAL PREFERENCES:
- Number of meals: ${mealPreferences.mealCount}
- Cuisine preference: ${mealPreferences.cuisinePreference || 'Any'}
- Excluded ingredients: ${mealPreferences.excludedIngredients?.join(', ') || 'None'}

Please create a meal plan that:
1. Meets the target calorie goal
2. Has a balanced macronutrient distribution (protein, carbs, fat)
3. Respects dietary preferences and excluded ingredients
4. Contains ${mealPreferences.mealCount} meals (including snacks if appropriate)
5. Reflects cultural preferences based on nationality when appropriate
6. Provides simple recipes or preparation instructions

Return the meal plan in this exact JSON format:
{
  "dailyPlan": {
    "totalCalories": 0,
    "totalProtein": 0,
    "totalCarbs": 0,
    "totalFat": 0,
    "meals": [
      {
        "name": "Meal name",
        "type": "breakfast/lunch/dinner/snack",
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "ingredients": ["ingredient 1", "ingredient 2"],
        "recipe": "Brief recipe instructions"
      }
    ]
  }
}
`;
      
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist creating personalized meal plans.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      });
      
      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new BadRequestError('Failed to generate meal plan');
      }
      
      // Parse the JSON from the response
      try {
        // First, try to clean the response in case it includes markdown code blocks
        const jsonString = result.replace(/```json|```/g, '').trim();
        
        // Try to parse the JSON
        const parsedData = JSON.parse(jsonString);
        
        // Validate the structure for meal plan
        if (!parsedData.dailyPlan) {
          console.error('Invalid response format from OpenAI:', parsedData);
          throw new Error('Invalid response format');
        }
        
        // Ensure dailyPlan has the expected structure
        const validatedData = {
          dailyPlan: {
            totalCalories: parsedData.dailyPlan.totalCalories || 0,
            totalProtein: parsedData.dailyPlan.totalProtein || 0,
            totalCarbs: parsedData.dailyPlan.totalCarbs || 0,
            totalFat: parsedData.dailyPlan.totalFat || 0,
            meals: Array.isArray(parsedData.dailyPlan.meals) ? parsedData.dailyPlan.meals.map(meal => ({
              name: meal.name || 'Unnamed Meal',
              type: meal.type || 'other',
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fat: meal.fat || 0,
              ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
              recipe: meal.recipe || ''
            })) : []
          }
        };
        
        return validatedData;
      } catch (parseError) {
        console.error('Failed to parse JSON from OpenAI response:', parseError);
        console.error('Raw response:', result);
        throw new BadRequestError('Failed to parse meal plan data from OpenAI response');
      }
    } catch (error: any) {
      if (error.name === 'BadRequestError') {
        throw error;
      }
      
      console.error('OpenAI API Error:', error);
      throw new BadRequestError('Failed to generate meal plan. Please check your API key or try again later.');
    }
  }
  
  // Generate weekly progress review
  static async generateProgressReview(
    userProfile: {
      name: string;
      weight: number;
      height: number;
      age: number;
      gender: string;
      activityLevel: string;
      goal: string;
      nationality: string;
      dietaryPreferences: string[];
      maintenanceCalories: number;
      targetCalories: number;
    },
    foodItems: any[],
    apiKey: string
  ): Promise<{
    summary: {
      period: string;
      daysTracked: number;
      avgCalories: number;
      avgProtein: number;
      calorieAdherence: string;
      targetCalories: number;
    };
    insights: Array<{
      title: string;
      content: string;
      type: 'info' | 'warning' | 'success' | 'error';
    }>;
    nextWeekFocus: {
      title: string;
      content: string;
      type: string;
    };
  }> {
    try {
      const openai = OpenAIService.createOpenAI(apiKey);
      
      // Group food items by date to determine days tracked
      const foodByDate = foodItems.reduce((acc: Record<string, any[]>, item: any) => {
        const dateKey = new Date(item.date).toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
      }, {});
      
      const daysTracked = Object.keys(foodByDate).length;
      
      // Calculate averages
      const totalCalories = foodItems.reduce((sum, item) => sum + (item.calories || 0), 0);
      const totalProtein = foodItems.reduce((sum, item) => sum + (item.protein || 0), 0);
      
      const avgCalories = daysTracked > 0 ? Math.round(totalCalories / daysTracked) : 0;
      const avgProtein = daysTracked > 0 ? Math.round(totalProtein / daysTracked) : 0;
      
      // Calculate adherence percentage
      const adherencePercentage = userProfile.targetCalories > 0 
        ? Math.round((avgCalories / userProfile.targetCalories) * 100) 
        : 0;
      
      // Format food items for the prompt
      const foodSummary = Object.entries(foodByDate).map(([date, items]) => {
        const dailyCalories = items.reduce((sum, item) => sum + (item.calories || 0), 0);
        const itemsList = items.map(item => 
          `${item.name} (${item.quantity}): ${item.calories} calories`
        ).join(', ');
        
        return `${date}: Total ${dailyCalories} calories - ${itemsList}`;
      }).join('\n');
      
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 7);
      
      const periodString = `${startDate.toLocaleDateString()} to ${today.toLocaleDateString()}`;
      
      const prompt = `
You are a professional nutritionist providing a weekly progress review to a client.

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
- Target Calories: ${userProfile.targetCalories} calories/day

WEEKLY NUTRITION DATA:
- Period: ${periodString}
- Days tracked: ${daysTracked} out of 7
- Average daily calories: ${avgCalories}
- Average daily protein: ${avgProtein}g
- Calorie adherence: ${adherencePercentage}% of target

FOOD LOG:
${foodSummary || "No food items logged for this period."}

Based on this information, create a weekly progress review with:
1. A summary of their week
2. Personalized insights about their eating patterns, nutrition balance, and progress toward their goals
3. A recommended focus area for next week

Your response should be in this exact JSON format:
{
  "summary": {
    "period": "${periodString}",
    "daysTracked": ${daysTracked},
    "avgCalories": ${avgCalories},
    "avgProtein": ${avgProtein},
    "calorieAdherence": "${adherencePercentage}%",
    "targetCalories": ${userProfile.targetCalories}
  },
  "insights": [
    {
      "title": "Insight title 1",
      "content": "Detailed insight that is personalized and actionable",
      "type": "info, warning, success, or error - choose appropriate type"
    },
    {
      "title": "Insight title 2",
      "content": "Another detailed insight about their nutrition",
      "type": "info, warning, success, or error - choose appropriate type"
    },
    {
      "title": "Insight title 3",
      "content": "A third detailed insight about their progress",
      "type": "info, warning, success, or error - choose appropriate type"
    }
  ],
  "nextWeekFocus": {
    "title": "Focus title",
    "content": "Detailed recommendation for what to focus on next week",
    "type": "primary"
  }
}
`;
      
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist providing a weekly progress review.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new BadRequestError('Failed to generate weekly review');
      }
      
      // Parse the JSON from the response
      try {
        // Clean the response in case it includes markdown code blocks
        const jsonString = result.replace(/```json|```/g, '').trim();
        
        // Parse the JSON
        const parsedData = JSON.parse(jsonString);
        
        // Validate the structure
        if (!parsedData.summary || !Array.isArray(parsedData.insights) || !parsedData.nextWeekFocus) {
          console.error('Invalid response format from OpenAI:', parsedData);
          throw new Error('Invalid response format');
        }
        
        // Create default review if no tracking data
        if (daysTracked === 0) {
          return {
            summary: {
              period: periodString,
              daysTracked: 0,
              avgCalories: 0,
              avgProtein: 0,
              calorieAdherence: "0%",
              targetCalories: userProfile.targetCalories
            },
            insights: [
              {
                title: "No tracking data available",
                content: "You haven't logged any food items in the past week. Start tracking your meals to receive personalized insights.",
                type: "info"
              }
            ],
            nextWeekFocus: {
              title: "Begin Tracking Your Food",
              content: "Focus on consistently logging your meals and snacks each day to build a foundation for meaningful nutrition analysis.",
              type: "primary"
            }
          };
        }
        
        return parsedData;
      } catch (parseError) {
        console.error('Failed to parse JSON from OpenAI response:', parseError);
        console.error('Raw response:', result);
        throw new BadRequestError('Failed to parse weekly review from OpenAI response');
      }
    } catch (error: any) {
      if (error.name === 'BadRequestError') {
        throw error;
      }
      
      console.error('OpenAI API Error:', error);
      throw new BadRequestError('Failed to generate weekly review. Please check your API key or try again later.');
    }
  }
  
  // Generate coaching advice based on a topic and user profile
  static async generateCoachingAdvice(
    topic: string,
    userProfile: {
      name: string;
      weight: number;
      height: number;
      age: number;
      gender: string;
      activityLevel: string;
      goal: string;
      nationality: string;
      dietaryPreferences: string[];
      maintenanceCalories: number;
      targetCalories: number;
    },
    apiKey: string
  ): Promise<{
    title: string;
    content: string;
    actionItems: string[];
    type: 'info' | 'warning' | 'success' | 'error';
  }> {
    try {
      const openai = OpenAIService.createOpenAI(apiKey);
      
      const prompt = `
You are a professional nutritionist providing personalized coaching advice to a client.

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
- Target Calories: ${userProfile.targetCalories} calories/day

The client has requested coaching on the topic of "${topic}".

Please provide coaching advice that is:
1. Personalized to their profile details
2. Specific to the requested topic 
3. Actionable and practical
4. Evidence-based and scientifically sound
5. Supportive and motivational

Your response should be in this exact JSON format:
{
  "title": "A concise, engaging title for the advice",
  "content": "Detailed coaching advice (2-3 paragraphs) that is personalized to the user's profile and addresses the specific topic",
  "actionItems": ["Specific action item 1", "Specific action item 2", "Specific action item 3", "Specific action item 4", "Specific action item 5"],
  "type": "info, warning, success, or error - choose the most appropriate type based on the advice context"
}
`;
      
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist providing personalized coaching advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new BadRequestError('Failed to generate coaching advice');
      }
      
      // Parse the JSON from the response
      try {
        // Clean the response in case it includes markdown code blocks
        const jsonString = result.replace(/```json|```/g, '').trim();
        
        // Parse the JSON
        const parsedData = JSON.parse(jsonString);
        
        // Validate the structure
        if (!parsedData.title || !parsedData.content || !Array.isArray(parsedData.actionItems)) {
          console.error('Invalid response format from OpenAI:', parsedData);
          throw new Error('Invalid response format');
        }
        
        // Ensure proper type
        let type: 'info' | 'warning' | 'success' | 'error' = 'info';
        if (['info', 'warning', 'success', 'error'].includes(parsedData.type)) {
          type = parsedData.type as 'info' | 'warning' | 'success' | 'error';
        }
        
        return {
          title: parsedData.title,
          content: parsedData.content,
          actionItems: parsedData.actionItems,
          type: type
        };
      } catch (parseError) {
        console.error('Failed to parse JSON from OpenAI response:', parseError);
        console.error('Raw response:', result);
        throw new BadRequestError('Failed to parse coaching advice from OpenAI response');
      }
    } catch (error: any) {
      if (error.name === 'BadRequestError') {
        throw error;
      }
      
      console.error('OpenAI API Error:', error);
      throw new BadRequestError('Failed to generate coaching advice. Please check your API key or try again later.');
    }
  }
  
  // Generate recipe based on ingredients
  static async generateRecipe(
    ingredients: string[],
    preferences: {
      cuisineType?: string;
      dietaryRestrictions?: string[];
      difficulty?: 'easy' | 'medium' | 'hard';
      timeLimit?: number;
    },
    apiKey: string
  ): Promise<{
    name: string;
    cuisine: string;
    prepTime: number;
    cookTime: number;
    difficulty: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: Array<{ name: string; amount: string }>;
    instructions: string[];
    tips?: string[];
  }> {
    try {
      const openai = OpenAIService.createOpenAI(apiKey);
      
      const prompt = `
Create a recipe using these ingredients: ${ingredients.join(', ')}.

PREFERENCES:
- Cuisine: ${preferences.cuisineType || 'Any'}
- Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Difficulty level: ${preferences.difficulty || 'Medium'}
- Time limit: ${preferences.timeLimit ? preferences.timeLimit + ' minutes' : 'No limit'}

Please create a recipe that:
1. Uses most or all of the ingredients listed
2. Follows the cuisine style if specified
3. Respects any dietary restrictions
4. Matches the requested difficulty level
5. Can be prepared within the time limit if specified
6. Includes nutritional information

Return the recipe in this exact JSON format:
{
  "name": "Recipe name",
  "cuisine": "Cuisine type",
  "prepTime": 0,
  "cookTime": 0,
  "difficulty": "easy/medium/hard",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "ingredients": [
    { "name": "ingredient name", "amount": "amount with unit" }
  ],
  "instructions": ["Step 1", "Step 2"],
  "tips": ["Optional tip 1", "Optional tip 2"]
}
`;
      
      const response = await openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef creating custom recipes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });
      
      const result = response.choices[0]?.message?.content;
      
      if (!result) {
        throw new BadRequestError('Failed to generate recipe');
      }
      
      // Parse the JSON from the response
      const jsonString = result.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonString);
    } catch (error: any) {
      if (error.name === 'BadRequestError') {
        throw error;
      }
      
      console.error('OpenAI API Error:', error);
      throw new BadRequestError('Failed to generate recipe. Please check your API key or try again later.');
    }
  }
}