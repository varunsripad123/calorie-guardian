import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Food from '../models/Food.js';
import User from '../models/User.js';
import { BadRequestError, NotFoundError } from '../utils/errorHandler.js';

// @desc    Add a food item
// @route   POST /api/food
// @access  Private
export const addFoodItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, quantity, calories, protein, carbs, fat, date, aiGenerated } = req.body;
    
    const food = await Food.create({
      userId: req.user._id,
      name,
      quantity,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      date: date ? new Date(date) : new Date(),
      aiGenerated: aiGenerated || false
    });
    
    res.status(201).json({
      success: true,
      food
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food items for a specific date
// @route   GET /api/food
// @access  Private
export const getFoodItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get date from query params or use today's date
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();
    
    // Set start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const foodItems = await Food.find({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: 1 });
    
    // Calculate totals
    const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = foodItems.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = foodItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = foodItems.reduce((sum, item) => sum + item.fat, 0);
    
    res.status(200).json({
      success: true,
      date: date.toISOString().split('T')[0],
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      items: foodItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food item
// @route   DELETE /api/food/:id
// @access  Private
export const deleteFoodItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      throw new NotFoundError('Food item not found');
    }
    
    // Check if the food item belongs to the user
    if (food.userId.toString() !== req.user._id.toString()) {
      throw new BadRequestError('Not authorized to delete this food item');
    }
    
    await food.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Food item deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nutrition summary for date range
// @route   GET /api/food/summary
// @access  Private
export const getNutritionSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get start and end dates from query params
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Get user profile for target calories
    const user = await User.findById(req.user._id);
    
    if (!user || !user.profile) {
      throw new BadRequestError('User profile not found. Please update your profile first.');
    }
    
    const targetCalories = user.profile.targetCalories;
    
    // Aggregate food data by date
    const dailySummary = await Food.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFat: { $sum: '$fat' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format the result
    const summary = dailySummary.map(day => ({
      date: day._id,
      totalCalories: day.totalCalories,
      totalProtein: day.totalProtein,
      totalCarbs: day.totalCarbs,
      totalFat: day.totalFat,
      count: day.count,
      targetCalories
    }));
    
    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};