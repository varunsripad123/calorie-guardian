// API base URL
export const API_BASE_URL = 'http://localhost:5000/api';

// App name
export const APP_NAME = 'Calorie Guardian';

// Default date format
export const DATE_FORMAT = 'MMMM d, yyyy';

// Activity level labels and values
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (exercise 1-3 times/week)' },
  { value: 'moderate', label: 'Moderate (exercise 3-5 times/week)' },
  { value: 'active', label: 'Active (exercise 6-7 times/week)' },
  { value: 'very active', label: 'Very Active (intense exercise daily)' },
];

// Weight goals
export const GOALS = [
  { value: 'lose', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'gain', label: 'Gain Weight' },
];

// Genders
export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Default dietary preferences
export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Low Carb',
  'Gluten Free',
  'Dairy Free',
  'Paleo',
  'Mediterranean',
  'Halal',
  'Kosher',
  'No Restrictions',
];

// Macro distribution for different goals
export const MACRO_DISTRIBUTION = {
  lose: { protein: 0.4, carbs: 0.3, fat: 0.3 },
  maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  gain: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};