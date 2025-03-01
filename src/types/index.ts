
export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  timestamp: Date;
  aiGenerated: boolean;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: FoodItem[];
}

export interface UserProfile {
  name: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  goal: 'lose' | 'maintain' | 'gain';
  maintenanceCalories: number;
  targetCalories: number;
}

export interface NutritionAdvice {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}
