import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Server Error',
      errors: err.errors || [],
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

// Create custom error with status code
export class CustomError extends Error {
  statusCode: number;
  errors?: any[];
  
  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not Found Error
export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// Bad Request Error
export class BadRequestError extends CustomError {
  constructor(message: string = 'Bad request', errors?: any[]) {
    super(message, 400, errors);
  }
}

// Unauthorized Error
export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

// Forbidden Error
export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}