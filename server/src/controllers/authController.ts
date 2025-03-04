import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { BadRequestError, UnauthorizedError } from '../utils/errorHandler.js';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      throw new BadRequestError('User already exists');
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate token
    const token = generateToken((user._id as unknown as string).toString());
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Check if password matches
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken((user._id as unknown as string).toString());
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile || null,
        apiKey: user.apiKey || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile || null,
        apiKey: user.apiKey || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save OpenAI API key
// @route   PUT /api/auth/apikey
// @access  Private
export const saveApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      throw new BadRequestError('API key is required');
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { apiKey },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    res.status(200).json({
      success: true,
      message: 'API key saved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile || null,
        apiKey: user.apiKey || null
      }
    });
  } catch (error) {
    next(error);
  }
};