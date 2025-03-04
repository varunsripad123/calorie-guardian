import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

// Calculate maintenance calories using the Mifflin-St Jeor Equation
const calculateMaintenanceCalories = (profile: {
  weight: number;
  height: number; 
  age: number;
  gender: string;
  activityLevel: string;
}): number => {
  const { weight, height, age, gender, activityLevel } = profile;
  
  // Base BMR calculation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very active': 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

// Calculate target calories based on goal
const calculateTargetCalories = (maintenanceCalories: number, goal: string): number => {
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

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      nationality,
      dietaryPreferences
    } = req.body;
    
    // Calculate maintenance calories
    const maintenanceCalories = calculateMaintenanceCalories({
      weight,
      height,
      age,
      gender,
      activityLevel
    });
    
    // Calculate target calories
    const targetCalories = calculateTargetCalories(maintenanceCalories, goal);
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        profile: {
          weight,
          height,
          age,
          gender,
          activityLevel,
          goal,
          nationality,
          dietaryPreferences,
          maintenanceCalories,
          targetCalories
        }
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }
    
    res.status(200).json({
      success: true,
      profile: updatedUser.profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    res.status(200).json({
      success: true,
      profile: user.profile || null
    });
  } catch (error) {
    next(error);
  }
};