/**
 * This is a temporary server file to get you started quickly.
 * It implements basic routes for testing the frontend functionality.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for testing (replace with MongoDB in production)
const users = [];
const foods = {};

// Mock JWT token generation
const generateToken = (userId) => {
  return `mock-jwt-token-${userId}`;
};

// Routes
// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: { message: 'User already exists' }
    });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, this would be hashed
    profile: null,
    apiKey: null
  };
  
  users.push(newUser);
  
  // Generate token
  const token = generateToken(newUser.id);
  
  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      profile: newUser.profile
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid credentials' }
    });
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      apiKey: user.apiKey
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      apiKey: user.apiKey
    }
  });
});

app.put('/api/auth/apikey', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  const { apiKey } = req.body;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  // Update API key
  user.apiKey = apiKey;
  
  res.status(200).json({
    success: true,
    message: 'API key saved successfully',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      apiKey: user.apiKey
    }
  });
});

// Profile routes
app.get('/api/profile', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  res.status(200).json({
    success: true,
    profile: user.profile
  });
});

app.put('/api/profile', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  // Update profile
  user.profile = req.body;
  
  // Calculate maintenance and target calories (simplified)
  if (!user.profile.maintenanceCalories) {
    user.profile.maintenanceCalories = 2000;
  }
  
  if (!user.profile.targetCalories) {
    user.profile.targetCalories = user.profile.goal === 'lose' ? 1600 : 
                                 user.profile.goal === 'gain' ? 2400 : 2000;
  }
  
  res.status(200).json({
    success: true,
    profile: user.profile
  });
});

// OpenAI routes
app.post('/api/openai/analyze-food', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  const { foodDescription } = req.body;
  
  if (!foodDescription) {
    return res.status(400).json({
      success: false,
      error: { message: 'Food description is required' }
    });
  }
  
  // Mock food analysis response (would normally use OpenAI)
  let mockFood;
  
  if (foodDescription.toLowerCase().includes('pizza')) {
    mockFood = {
      name: 'Pizza',
      quantity: '1 slice',
      calories: 285,
      protein: 12,
      carbs: 36,
      fat: 10
    };
  } else if (foodDescription.toLowerCase().includes('salad')) {
    mockFood = {
      name: 'Caesar Salad',
      quantity: '1 bowl',
      calories: 120,
      protein: 5,
      carbs: 8,
      fat: 9
    };
  } else if (foodDescription.toLowerCase().includes('chicken')) {
    mockFood = {
      name: 'Grilled Chicken Breast',
      quantity: '1 piece (100g)',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 4
    };
  } else {
    mockFood = {
      name: foodDescription,
      quantity: '1 serving',
      calories: 200,
      protein: 8,
      carbs: 20,
      fat: 10
    };
  }
  
  res.status(200).json({
    success: true,
    food: mockFood
  });
});

app.post('/api/openai/nutrition-advice', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  if (!user.profile) {
    return res.status(400).json({
      success: false,
      error: { message: 'User profile not complete' }
    });
  }
  
  // Get foods for the user
  const userFoods = foods[userId] || [];
  
  // Generate personalized advice based on profile and foods
  let message = '';
  let type = 'info';
  
  const { goal, targetCalories, gender, activityLevel, dietaryPreferences = [] } = user.profile;
  
  // Calculate total calories consumed
  const totalCalories = userFoods.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = userFoods.reduce((sum, item) => sum + (item.protein || 0), 0);
  const caloriePercentage = (totalCalories / targetCalories) * 100;
  
  if (userFoods.length === 0) {
    // No foods logged yet
    if (goal === 'lose') {
      message = `Based on your profile, you should aim for ${targetCalories} calories today to support your weight loss goals. Try starting with a protein-rich breakfast to keep you fuller for longer.`;
    } else if (goal === 'gain') {
      message = `To support your weight gain goals, aim for ${targetCalories} calories today. Focus on nutrient-dense foods like nuts, avocados, and lean proteins.`;
    } else {
      message = `To maintain your weight, aim for ${targetCalories} calories today. Remember to include a balance of proteins, carbs, and healthy fats.`;
    }
  } else if (caloriePercentage < 25) {
    // Under 25% of daily calories
    message = `You've only consumed ${totalCalories} calories (${Math.round(caloriePercentage)}% of your ${targetCalories} calorie target). Based on your ${activityLevel} activity level, consider adding more nutrient-dense foods to your day.`;
    
    // Add personalized food suggestions based on dietary preferences
    if (dietaryPreferences.includes('Vegetarian')) {
      message += " Some vegetarian options include lentil soup, a quinoa bowl, or a Greek yogurt parfait.";
    } else if (dietaryPreferences.includes('Vegan')) {
      message += " Some vegan options include a tofu stir-fry, chickpea curry, or a smoothie with plant-based protein.";
    } else {
      message += " Consider adding a balanced meal with lean protein, complex carbs, and healthy fats.";
    }
  } else if (caloriePercentage < 75) {
    // Between 25-75% of daily calories
    if (totalProtein < user.profile.weight * 0.5) {
      message = `You've consumed ${totalCalories} calories (${Math.round(caloriePercentage)}% of your target). Your protein intake is a bit low for your goals - try adding more protein-rich foods to your next meal.`;
    } else {
      message = `You're making good progress with ${totalCalories} calories (${Math.round(caloriePercentage)}% of your target). Keep up the balanced eating for the rest of the day!`;
      type = 'success';
    }
  } else if (caloriePercentage < 100) {
    // Between 75-100% of daily calories
    message = `You've almost reached your calorie target for the day with ${totalCalories} calories (${Math.round(caloriePercentage)}% of your ${targetCalories} calorie target). Great job balancing your nutrition today!`;
    type = 'success';
  } else if (caloriePercentage < 120) {
    // Slightly over target
    if (goal === 'lose') {
      message = `You're slightly over your ${targetCalories} calorie target with ${totalCalories} calories consumed. Consider a light activity like walking to help maintain your caloric deficit.`;
      type = 'warning';
    } else {
      message = `You've reached your calorie target with ${totalCalories} calories. Make sure you're getting enough water and fiber for proper digestion.`;
      type = 'success';
    }
  } else {
    // Significantly over target
    message = `You've consumed ${totalCalories} calories, which is ${Math.round(caloriePercentage - 100)}% over your daily target of ${targetCalories}. That's okay for today - tomorrow try to focus on nutrient-dense foods that keep you satisfied longer.`;
    type = goal === 'lose' ? 'warning' : 'info';
  }
  
  // Add advice based on gender if appropriate
  if (gender === 'female' && totalCalories < 1200 && goal !== 'lose') {
    message += " Note that women generally shouldn't consume fewer than 1200 calories daily to ensure adequate nutrition.";
  } else if (gender === 'male' && totalCalories < 1500 && goal !== 'lose') {
    message += " Note that men generally shouldn't consume fewer than 1500 calories daily to ensure adequate nutrition.";
  }
  
  const advice = { message, type };
  
  res.status(200).json({
    success: true,
    advice
  });
});

// Food routes
app.post('/api/food', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Initialize user's food array if it doesn't exist
  if (!foods[userId]) {
    foods[userId] = [];
  }
  
  // Create food item with generated ID
  const foodItem = {
    ...req.body,
    id: Date.now().toString(),
    userId
  };
  
  // Add to user's foods
  foods[userId].push(foodItem);
  
  res.status(201).json({
    success: true,
    food: foodItem
  });
});

app.get('/api/food', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Get user's foods
  const userFoods = foods[userId] || [];
  
  // Filter by date if provided
  const dateParam = req.query.date;
  let filteredFoods = userFoods;
  
  if (dateParam) {
    const date = new Date(dateParam);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    filteredFoods = userFoods.filter(food => {
      const foodDate = new Date(food.date);
      return foodDate.toISOString().split('T')[0] === dateString;
    });
  }
  
  // Calculate totals
  const totalCalories = filteredFoods.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = filteredFoods.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalCarbs = filteredFoods.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalFat = filteredFoods.reduce((sum, item) => sum + (item.fat || 0), 0);
  
  res.status(200).json({
    success: true,
    date: dateParam || new Date().toISOString().split('T')[0],
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    items: filteredFoods
  });
});

// Meal planning endpoint
app.post('/api/openai/meal-plan', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  if (!user.profile) {
    return res.status(400).json({
      success: false,
      error: { message: 'User profile not complete' }
    });
  }
  
  const { mealCount = 3, cuisinePreference } = req.body;
  const { goal, targetCalories, dietaryPreferences = [] } = user.profile;
  
  // Calculate calories per meal
  const caloriesPerMeal = Math.round(targetCalories / mealCount);
  
  // Generate mock meal plan based on user preferences
  const mealPlan = {
    dailyPlan: {
      totalCalories: targetCalories,
      totalProtein: Math.round(targetCalories * 0.3 / 4), // 30% of calories from protein
      totalCarbs: Math.round(targetCalories * 0.4 / 4),   // 40% of calories from carbs
      totalFat: Math.round(targetCalories * 0.3 / 9),    // 30% of calories from fat
      meals: []
    }
  };
  
  // Check if vegetarian or vegan
  const isVegetarian = dietaryPreferences.includes('Vegetarian') || dietaryPreferences.includes('Vegan');
  const isVegan = dietaryPreferences.includes('Vegan');
  
  // Generate meals based on preferences
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const generateMeal = (type, calories) => {
    let meal = {
      name: '',
      type,
      calories,
      protein: Math.round(calories * 0.3 / 4),
      carbs: Math.round(calories * 0.4 / 4),
      fat: Math.round(calories * 0.3 / 9),
      ingredients: [],
      recipe: ''
    };
    
    // Generate meal based on type and dietary preferences
    if (type === 'breakfast') {
      if (isVegan) {
        meal.name = 'Vegan Overnight Oats';
        meal.ingredients = ['oats', 'almond milk', 'chia seeds', 'maple syrup', 'berries', 'nuts'];
        meal.recipe = 'Mix oats with almond milk and chia seeds. Add sweetener to taste. Refrigerate overnight and top with berries and nuts.';
      } else if (isVegetarian) {
        meal.name = 'Greek Yogurt Parfait';
        meal.ingredients = ['greek yogurt', 'honey', 'granola', 'mixed berries', 'sliced almonds'];
        meal.recipe = 'Layer greek yogurt with honey, granola, and berries in a glass. Top with sliced almonds.';
      } else {
        meal.name = 'Protein Scramble';
        meal.ingredients = ['eggs', 'spinach', 'bell peppers', 'feta cheese', 'whole grain toast'];
        meal.recipe = 'Whisk eggs and pour into a hot pan. Add chopped vegetables and feta. Serve with toast.';
      }
    } else if (type === 'lunch') {
      if (isVegan) {
        meal.name = 'Quinoa Buddha Bowl';
        meal.ingredients = ['quinoa', 'chickpeas', 'avocado', 'roasted vegetables', 'tahini dressing'];
        meal.recipe = 'Cook quinoa according to package. Roast vegetables at 400°F for 20 minutes. Assemble bowl with quinoa, chickpeas, avocado, and vegetables. Drizzle with tahini dressing.';
      } else if (isVegetarian) {
        meal.name = 'Mediterranean Wrap';
        meal.ingredients = ['whole grain wrap', 'hummus', 'feta cheese', 'cucumber', 'tomato', 'olives', 'mixed greens'];
        meal.recipe = 'Spread hummus on wrap. Layer with vegetables, feta, and greens. Roll up and slice in half.';
      } else {
        meal.name = 'Grilled Chicken Salad';
        meal.ingredients = ['chicken breast', 'mixed greens', 'cherry tomatoes', 'cucumber', 'olive oil', 'balsamic vinegar'];
        meal.recipe = 'Grill chicken until cooked through. Slice and arrange over mixed greens with vegetables. Drizzle with olive oil and balsamic vinegar.';
      }
    } else if (type === 'dinner') {
      if (cuisinePreference === 'Italian' || !cuisinePreference) {
        if (isVegan) {
          meal.name = 'Vegan Pasta Primavera';
          meal.ingredients = ['whole grain pasta', 'zucchini', 'bell peppers', 'cherry tomatoes', 'garlic', 'olive oil', 'nutritional yeast'];
          meal.recipe = 'Cook pasta according to package. Sauté vegetables with garlic and olive oil. Mix with pasta and sprinkle with nutritional yeast.';
        } else if (isVegetarian) {
          meal.name = 'Eggplant Parmesan';
          meal.ingredients = ['eggplant', 'marinara sauce', 'mozzarella cheese', 'parmesan cheese', 'basil', 'olive oil'];
          meal.recipe = 'Slice eggplant, brush with olive oil, and bake until tender. Layer with marinara and cheese, then bake until cheese melts.';
        } else {
          meal.name = 'Baked Salmon with Roasted Vegetables';
          meal.ingredients = ['salmon fillet', 'broccoli', 'sweet potatoes', 'olive oil', 'lemon', 'garlic', 'herbs'];
          meal.recipe = 'Season salmon with herbs, garlic, and lemon. Bake at 375°F for 15-20 minutes. Roast vegetables tossed in olive oil until tender.';
        }
      } else if (cuisinePreference === 'Asian') {
        if (isVegan) {
          meal.name = 'Vegan Stir-Fry with Tofu';
          meal.ingredients = ['tofu', 'broccoli', 'carrots', 'bell peppers', 'soy sauce', 'ginger', 'garlic', 'brown rice'];
          meal.recipe = 'Press and cube tofu. Stir-fry with vegetables, garlic, and ginger. Add soy sauce and serve over brown rice.';
        } else if (isVegetarian) {
          meal.name = 'Vegetable Fried Rice';
          meal.ingredients = ['brown rice', 'eggs', 'peas', 'carrots', 'onion', 'garlic', 'soy sauce', 'sesame oil'];
          meal.recipe = 'Scramble eggs in a wok. Add cooked rice and vegetables. Stir-fry with soy sauce and sesame oil.';
        } else {
          meal.name = 'Teriyaki Chicken with Rice';
          meal.ingredients = ['chicken breast', 'brown rice', 'broccoli', 'teriyaki sauce', 'sesame seeds', 'green onions'];
          meal.recipe = 'Cook chicken in teriyaki sauce. Serve over brown rice with steamed broccoli and garnish with sesame seeds and green onions.';
        }
      }
    } else if (type === 'snack') {
      if (isVegan) {
        meal.name = 'Apple with Almond Butter';
        meal.ingredients = ['apple', 'almond butter'];
        meal.recipe = 'Slice apple and serve with a tablespoon of almond butter.';
      } else if (isVegetarian) {
        meal.name = 'Greek Yogurt with Honey';
        meal.ingredients = ['greek yogurt', 'honey', 'cinnamon'];
        meal.recipe = 'Mix greek yogurt with honey and a sprinkle of cinnamon.';
      } else {
        meal.name = 'Hard-Boiled Eggs with Fruit';
        meal.ingredients = ['eggs', 'apple or orange'];
        meal.recipe = 'Enjoy hard-boiled eggs with a piece of fruit.';
      }
    }
    
    return meal;
  };
  
  // Generate meals based on meal count
  if (mealCount === 3) {
    mealPlan.dailyPlan.meals.push(generateMeal('breakfast', Math.round(targetCalories * 0.25)));
    mealPlan.dailyPlan.meals.push(generateMeal('lunch', Math.round(targetCalories * 0.35)));
    mealPlan.dailyPlan.meals.push(generateMeal('dinner', Math.round(targetCalories * 0.4)));
  } else if (mealCount === 4) {
    mealPlan.dailyPlan.meals.push(generateMeal('breakfast', Math.round(targetCalories * 0.25)));
    mealPlan.dailyPlan.meals.push(generateMeal('lunch', Math.round(targetCalories * 0.3)));
    mealPlan.dailyPlan.meals.push(generateMeal('snack', Math.round(targetCalories * 0.15)));
    mealPlan.dailyPlan.meals.push(generateMeal('dinner', Math.round(targetCalories * 0.3)));
  } else if (mealCount === 5) {
    mealPlan.dailyPlan.meals.push(generateMeal('breakfast', Math.round(targetCalories * 0.2)));
    mealPlan.dailyPlan.meals.push(generateMeal('snack', Math.round(targetCalories * 0.1)));
    mealPlan.dailyPlan.meals.push(generateMeal('lunch', Math.round(targetCalories * 0.3)));
    mealPlan.dailyPlan.meals.push(generateMeal('snack', Math.round(targetCalories * 0.1)));
    mealPlan.dailyPlan.meals.push(generateMeal('dinner', Math.round(targetCalories * 0.3)));
  } else {
    // Default to 3 meals
    mealPlan.dailyPlan.meals.push(generateMeal('breakfast', Math.round(targetCalories * 0.25)));
    mealPlan.dailyPlan.meals.push(generateMeal('lunch', Math.round(targetCalories * 0.35)));
    mealPlan.dailyPlan.meals.push(generateMeal('dinner', Math.round(targetCalories * 0.4)));
  }
  
  res.status(200).json({
    success: true,
    mealPlan: mealPlan.dailyPlan
  });
});

// Health coaching and habit formation endpoints
app.post('/api/openai/coaching', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  if (!user.profile) {
    return res.status(400).json({
      success: false,
      error: { message: 'User profile not complete' }
    });
  }
  
  // Get user's food data for coaching
  const userFoods = foods[userId] || [];
  
  // Extract coaching topic from request
  const { topic } = req.body;
  
  // Generate personalized coaching advice
  let coaching = {
    title: '',
    content: '',
    actionItems: [],
    type: 'info'
  };
  
  const { goal, gender, age, activityLevel } = user.profile;
  
  // Generate coaching based on requested topic
  switch(topic) {
    case 'portion-control':
      coaching = {
        title: 'Mastering Portion Control',
        content: `Based on your ${goal} goal and ${activityLevel} activity level, controlling portions is key to managing your calorie intake. Start by using smaller plates to create visual fullness. Try the hand method: your palm for protein, fist for carbs, and thumb for fats. This simple technique helps build awareness without measuring everything.`,
        actionItems: [
          'Use smaller plates and bowls',
          'Wait 20 minutes before taking seconds',
          'Pre-portion snack foods instead of eating from packages',
          'Fill half your plate with vegetables at lunch and dinner'
        ],
        type: 'info'
      };
      break;
      
    case 'mindful-eating':
      coaching = {
        title: 'Developing Mindful Eating Habits',
        content: `Many people struggle with mindless eating, which can derail nutrition goals. I notice you sometimes log multiple food entries close together, which might indicate distracted eating. Try eliminating screens during meals and focus on each bite, noticing textures and flavors. Chew thoroughly and put your fork down between bites.`,
        actionItems: [
          'Eat without digital distractions',
          'Set a timer for 20-minute meals',
          'Check in with your hunger levels before, during and after eating',
          'Put your utensils down between bites'
        ],
        type: 'info'
      };
      break;
      
    case 'meal-prep':
      const prepAdvice = goal === 'lose' 
        ? 'prepare portion-controlled meals' 
        : goal === 'gain' 
          ? 'prepare calorie-dense, nutrient-rich meals' 
          : 'prepare balanced, nutrient-dense meals';
          
      coaching = {
        title: 'Effective Meal Preparation Strategies',
        content: `With your ${activityLevel} lifestyle, meal prepping can help you stay consistent. Set aside 2-3 hours on a weekend to ${prepAdvice}. Start with a simple formula: a lean protein, complex carb, and vegetables for each meal. Prepare versatile bases like rice, quinoa, or roasted vegetables that can be mixed with different proteins and sauces through the week.`,
        actionItems: [
          'Choose 2-3 recipes to prepare each week',
          'Invest in quality food storage containers',
          'Prep ingredients (chop vegetables, cook proteins) even if you don't cook full meals',
          'Make double batches and freeze portions for busy days'
        ],
        type: 'info'
      };
      break;
      
    case 'macro-balance':
      let macroAdvice = '';
      if (goal === 'lose') {
        macroAdvice = 'Focus on adequate protein (around 30% of calories) to preserve muscle mass during weight loss. Moderate your carbohydrates, emphasizing fiber-rich sources, and include healthy fats for satiety.';
      } else if (goal === 'gain') {
        macroAdvice = 'Prioritize protein (25-30% of calories) to support muscle growth, emphasize complex carbohydrates for energy, and include healthy fats to meet your calorie targets.';
      } else {
        macroAdvice = 'Aim for balanced macronutrients with approximately 25-30% protein, 45-55% carbohydrates, and 20-30% healthy fats for optimal energy and nutrition.';
      }
      
      coaching = {
        title: 'Balancing Your Macronutrients',
        content: `Understanding macronutrient balance is key for someone with your ${goal} goal and ${activityLevel} activity level. ${macroAdvice} Rather than drastically changing your diet, start by upgrading the quality of each macronutrient - lean proteins, complex carbs, and healthy fats.`,
        actionItems: [
          'Include protein with every meal and snack',
          'Choose complex carbohydrates over refined options',
          'Add healthy fats like avocado, nuts, and olive oil in moderation',
          'Track your macros for a week to identify patterns and areas for improvement'
        ],
        type: 'info'
      };
      break;
      
    case 'hydration':
      let hydrationGoal = '';
      if (gender === 'male') {
        hydrationGoal = 'around 3.7 liters (125 ounces)';
      } else if (gender === 'female') {
        hydrationGoal = 'around 2.7 liters (91 ounces)';
      } else {
        hydrationGoal = 'approximately 2.5-3.5 liters';
      }
      
      if (activityLevel === 'active' || activityLevel === 'very active') {
        hydrationGoal += ' or more, since you have a higher activity level';
      }
      
      coaching = {
        title: 'Optimizing Your Hydration',
        content: `Proper hydration is crucial for energy levels, appetite control, and overall health. For someone with your profile, aim for ${hydrationGoal} of fluid daily from water and other beverages. Dehydration is often mistaken for hunger, so staying well-hydrated can help prevent unnecessary snacking.`,
        actionItems: [
          'Start your day with a full glass of water',
          'Carry a reusable water bottle throughout the day',
          'Set reminders to drink water every hour',
          'Infuse water with fruit or herbs if you prefer flavored beverages'
        ],
        type: 'info'
      };
      break;
      
    case 'eating-out':
      coaching = {
        title: 'Navigating Restaurant Meals',
        content: `Restaurant meals can be challenging for nutrition goals, but with planning, you can make choices aligned with your ${goal} goal. Review menus online before dining out and identify healthier options. Consider sharing entrees or boxing half your meal before eating. Focus on grilled proteins, ask for dressings and sauces on the side, and don't hesitate to make special requests.`,
        actionItems: [
          'Preview menus before dining out',
          'Ask how food is prepared and request modifications if needed',
          'Order an appetizer and side instead of an entree',
          'Practice the plate method: half vegetables, quarter protein, quarter carbs'
        ],
        type: 'info'
      };
      break;
      
    default:
      // General coaching
      if (userFoods.length > 0) {
        // Base coaching on their food entries
        const hasHighSugar = userFoods.some(f => 
          f.name.toLowerCase().includes('candy') || 
          f.name.toLowerCase().includes('soda') || 
          f.name.toLowerCase().includes('cookie') ||
          f.name.toLowerCase().includes('cake')
        );
        
        const hasProcessed = userFoods.some(f => 
          f.name.toLowerCase().includes('chips') || 
          f.name.toLowerCase().includes('pizza') || 
          f.name.toLowerCase().includes('fast food')
        );
        
        const hasProtein = userFoods.some(f => 
          f.name.toLowerCase().includes('chicken') || 
          f.name.toLowerCase().includes('fish') || 
          f.name.toLowerCase().includes('beef') ||
          f.name.toLowerCase().includes('protein')
        );
        
        if (hasHighSugar) {
          coaching = {
            title: 'Managing Sugar Intake',
            content: `I notice some higher-sugar foods in your log. While there's room for all foods in a balanced diet, reducing added sugar can help with your ${goal} goal. Try gradually reducing portion sizes of sugary treats or find naturally sweet alternatives like fruit. Pay attention to how you feel after consuming sugar - energy levels, hunger, and cravings.`,
            actionItems: [
              'Read labels to identify hidden added sugars',
              'Try fruit to satisfy sweet cravings',
              'Reduce sugar in coffee/tea by 50%',
              'Drink water, sparkling water, or herbal tea instead of sweetened beverages'
            ],
            type: 'warning'
          };
        } else if (hasProcessed) {
          coaching = {
            title: 'Upgrading Processed Foods',
            content: `I see some processed foods in your log, which is normal in most diets. Instead of eliminating these completely, think about gradual upgrades. For example, try air-popped popcorn instead of chips, homemade pizza on whole grain crust, or making your own healthier version of takeout favorites.`,
            actionItems: [
              'Try making a homemade version of your favorite processed food',
              'Add extra vegetables to pre-made meals',
              'Look for versions with shorter ingredient lists and fewer additives',
              'Balance processed foods with whole foods in the same meal'
            ],
            type: 'info'
          };
        } else if (hasProtein) {
          coaching = {
            title: 'Building on Your Protein Habits',
            content: `Great job including quality protein sources! For someone with your ${goal} goal and ${activityLevel} activity level, this helps with satiety, muscle maintenance, and overall energy. To further optimize, try distributing protein throughout your day rather than having most in one meal.`,
            actionItems: [
              'Aim for 20-30g protein per meal',
              'Add a protein source to snacks',
              'Explore plant-based proteins if you haven't already',
              'Consider a protein-rich breakfast to start your day'
            ],
            type: 'success'
          };
        } else {
          coaching = {
            title: 'Building Sustainable Nutrition Habits',
            content: `Looking at your overall patterns, focus on consistency rather than perfection. For your ${goal} goal, small daily actions compound over time. Consider setting 1-2 specific nutrition goals each week rather than overhauling everything at once. Remember that nutrition is highly individual - pay attention to how different foods make you feel.`,
            actionItems: [
              'Add one serving of vegetables to your day',
              'Identify and plan for challenging eating situations',
              'Create a weekly meal rhythm with flexible themes',
              'Schedule regular check-ins with yourself about your nutrition goals'
            ],
            type: 'info'
          };
        }
      } else {
        // General coaching if no food entries
        coaching = {
          title: 'Building Your Nutrition Foundation',
          content: `For someone with your ${goal} goal and ${activityLevel} activity level, start with mastering the basics. Focus on meal timing and structure before worrying about perfect food choices. Aim for regular meals in a schedule that works for your lifestyle, include protein with each meal, and gradually increase your vegetable intake.`,
          actionItems: [
            'Establish a consistent meal schedule',
            'Include a source of protein with every meal',
            'Add vegetables to at least two meals daily',
            'Stay hydrated throughout the day'
          ],
          type: 'info'
        };
      }
  }
  
  res.status(200).json({
    success: true,
    coaching
  });
});

// Progress tracking and weekly review endpoint
app.post('/api/openai/progress-review', (req, res) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Not authorized' }
    });
  }
  
  // Extract user ID from token (mock implementation)
  const userId = token.split('-')[3];
  
  // Find user
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'User not found' }
    });
  }
  
  if (!user.profile) {
    return res.status(400).json({
      success: false,
      error: { message: 'User profile not complete' }
    });
  }
  
  // Get user's food data
  const userFoods = foods[userId] || [];
  
  // Generate mock weekly summary
  const currentDate = new Date();
  const lastWeekDate = new Date(currentDate);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  
  // Calculate weekly averages (mock data)
  const mockDays = 5; // Assume they tracked 5 days
  const avgCalories = userFoods.length > 0 
    ? Math.round(userFoods.reduce((sum, item) => sum + item.calories, 0) / mockDays)
    : Math.round(user.profile.targetCalories * 0.9); // Simulated average if no foods
    
  const avgProtein = userFoods.length > 0
    ? Math.round(userFoods.reduce((sum, item) => sum + (item.protein || 0), 0) / mockDays)
    : Math.round(user.profile.weight * 0.8); // Simulated
    
  const calorieAdherence = user.profile.targetCalories > 0
    ? Math.round((avgCalories / user.profile.targetCalories) * 100)
    : 90; // Default to 90% adherence
  
  // Generate weekly review
  const weeklyReview = {
    summary: {
      period: `${lastWeekDate.toLocaleDateString()} - ${currentDate.toLocaleDateString()}`,
      daysTracked: mockDays,
      avgCalories,
      avgProtein,
      calorieAdherence: `${calorieAdherence}%`,
      targetCalories: user.profile.targetCalories
    },
    insights: []
  };
  
  // Generate insights based on user's profile and data
  const { goal, activityLevel } = user.profile;
  
  // Calorie insight
  if (calorieAdherence < 80) {
    if (goal === 'lose') {
      weeklyReview.insights.push({
        title: 'Calorie Deficit',
        content: `You averaged ${avgCalories} calories per day, which is ${100-calorieAdherence}% below your target. While a deficit supports your weight loss goal, going too low can impact energy and nutrition. Try adding nutrient-dense foods like nuts, avocados, or olive oil to get closer to your target.`,
        type: 'warning'
      });
    } else if (goal === 'gain') {
      weeklyReview.insights.push({
        title: 'Calorie Intake',
        content: `You averaged ${avgCalories} calories daily, which is ${100-calorieAdherence}% below your target for weight gain. Consider adding 1-2 calorie-dense snacks or using a meal replacement shake between meals to increase your intake while maintaining food quality.`,
        type: 'warning'
      });
    } else {
      weeklyReview.insights.push({
        title: 'Calorie Intake',
        content: `You averaged ${avgCalories} calories daily, which is ${100-calorieAdherence}% below your maintenance target. While temporary dips are fine, consistently under-eating can impact energy and overall health. Focus on adding quality calories through additional servings of whole foods you enjoy.`,
        type: 'warning'
      });
    }
  } else if (calorieAdherence > 120) {
    if (goal === 'lose') {
      weeklyReview.insights.push({
        title: 'Calorie Intake',
        content: `You averaged ${avgCalories} calories daily, which is ${calorieAdherence-100}% above your weight loss target. This doesn't mean you failed - it's valuable data. Look for patterns in when you exceed your target. Consider adjusting meal timing or adding protein to increase satiety.`,
        type: 'warning'
      });
    } else if (goal === 'gain') {
      weeklyReview.insights.push({
        title: 'Calorie Surplus',
        content: `Great job exceeding your calorie target by ${calorieAdherence-100}%. For quality weight gain, ensure these extra calories include sufficient protein (aim for at least ${Math.round(user.profile.weight * 1.6)}g daily) and come from nutrient-dense sources rather than just calorie-dense ones.`,
        type: 'success'
      });
    } else {
      weeklyReview.insights.push({
        title: 'Calorie Balance',
        content: `You exceeded your maintenance calories by ${calorieAdherence-100}% on average. If this is a temporary fluctuation, there's no need for concern. If it's a consistent pattern and you're maintaining weight, you might consider adjusting your target to match your actual maintenance needs.`,
        type: 'info'
      });
    }
  } else {
    weeklyReview.insights.push({
      title: 'Calorie Target',
      content: `Excellent job staying within a good range of your calorie target! Consistency with your energy intake supports your ${goal} goal while ensuring nutritional adequacy. Keep up this pattern for sustainable progress.`,
      type: 'success'
    });
  }
  
  // Protein insight
  const proteinTarget = user.profile.weight * 1.6; // 1.6g per kg as a general target
  const proteinPercentage = Math.round((avgProtein / proteinTarget) * 100);
  
  if (proteinPercentage < 70) {
    weeklyReview.insights.push({
      title: 'Protein Intake',
      content: `Your protein intake averaged ${avgProtein}g daily, which is below the recommended level for your goals. Aim for around ${Math.round(proteinTarget)}g daily to support muscle maintenance, recovery, and satiety. Try adding a protein source to each meal and snack.`,
      type: 'warning'
    });
  } else if (proteinPercentage >= 70 && proteinPercentage < 90) {
    weeklyReview.insights.push({
      title: 'Protein Intake',
      content: `You're making good progress with protein, averaging ${avgProtein}g daily. To fully support your ${activityLevel} activity level and ${goal} goal, aim to increase slightly toward ${Math.round(proteinTarget)}g daily. Consider adding protein to your snacks or increasing portion sizes of protein at meals.`,
      type: 'info'
    });
  } else {
    weeklyReview.insights.push({
      title: 'Protein Intake',
      content: `Excellent job with your protein intake, averaging ${avgProtein}g daily. This level supports your ${activityLevel} activity level and ${goal} goal. Maintaining this intake will help with satiety, muscle maintenance, and overall nutrition quality.`,
      type: 'success'
    });
  }
  
  // Consistency insight
  if (mockDays < 3) {
    weeklyReview.insights.push({
      title: 'Tracking Consistency',
      content: `You tracked ${mockDays} days this week. While any tracking provides valuable information, aim for at least 4-5 days of consistent tracking to identify patterns and make informed adjustments. Remember, tracking isn't about perfection but learning about your habits.`,
      type: 'info'
    });
  } else if (mockDays >= 3 && mockDays < 6) {
    weeklyReview.insights.push({
      title: 'Tracking Consistency',
      content: `Good job tracking ${mockDays} days this week! Consistent tracking helps build awareness and identify patterns in your nutrition. Consider planning for situations that make tracking challenging, such as dining out or busy days.`,
      type: 'success'
    });
  } else {
    weeklyReview.insights.push({
      title: 'Tracking Consistency',
      content: `Excellent work tracking consistently throughout the week! This level of awareness is a powerful tool for making informed decisions about your nutrition. Remember that occasional breaks from tracking are normal and can be healthy too.`,
      type: 'success'
    });
  }
  
  // Add a fourth insight based on specific goal
  if (goal === 'lose') {
    weeklyReview.insights.push({
      title: 'Weight Loss Perspective',
      content: `Remember that sustainable weight loss involves more than just calories. Focus on the quality of your food choices, your energy levels, and how satisfied you feel. A moderate approach (no more than 1-2 pounds lost per week) leads to better long-term results than rapid weight loss.`,
      type: 'info'
    });
  } else if (goal === 'gain') {
    weeklyReview.insights.push({
      title: 'Quality Weight Gain',
      content: `For quality weight gain, nutrition timing can be as important as total intake. Consider having a nutritious snack before bed and immediately after workouts to maximize your anabolic window. Aim for a gradual increase of 0.25-0.5% of body weight per week for optimal muscle gain with minimal fat gain.`,
      type: 'info'
    });
  } else {
    weeklyReview.insights.push({
      title: 'Maintenance Mindset',
      content: `Maintaining weight is often undervalued, but it's an achievement worth celebrating. Focus on how your food choices support your energy, mood, and overall wellbeing. This is a great time to experiment with new recipes and meal patterns while keeping your calories consistent.`,
      type: 'info'
    });
  }
  
  // Add a recommendation for next week
  const nextWeekRecommendations = [
    'Focus on getting at least 2 servings of vegetables with lunch and dinner',
    'Aim to have a protein source with every meal and snack',
    'Work on spacing your meals 3-4 hours apart for stable energy',
    'Try prepping breakfasts ahead of time to start your day with quality nutrition',
    'Experiment with new healthy recipes to keep your meals interesting',
    'Practice eating without distractions for at least one meal per day',
    'Focus on proper hydration by drinking water before and between meals',
    'Plan your meals a day in advance to support intentional eating'
  ];
  
  const randomRecommendation = nextWeekRecommendations[Math.floor(Math.random() * nextWeekRecommendations.length)];
  
  weeklyReview.nextWeekFocus = {
    title: 'Focus for Next Week',
    content: randomRecommendation,
    type: 'info'
  };
  
  res.status(200).json({
    success: true,
    weeklyReview
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Temporary server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});