import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './utils/errorHandler.js';
import { optionalAuth } from './middlewares/auth.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB - temporarily disable to prevent crashes
try {
  console.log('MongoDB connection temporarily disabled');
  // connectDB();
} catch (error) {
  console.error('MongoDB connection error:', error);
  console.log('Continuing without database connection...');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Add optional auth middleware for public endpoints that can be enhanced with auth
app.use(optionalAuth);

// API routes
app.use('/api', routes);

// Public health check route
app.get('/health', (req: Request, res: Response) => {
  // Check if we have an OpenAI API key configured
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  // Get server status details
  const serverInfo = {
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    openai: {
      keyConfigured: hasApiKey,
      keyFormat: hasApiKey ? 
        (process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid' : 'invalid') : 
        'missing'
    },
    endpoints: [
      { path: '/api/openai/meal-plan', status: 'mocked' },
      { path: '/api/openai/coaching', status: 'mocked' },
      { path: '/api/openai/progress-review', status: 'mocked' }
    ]
  };
  
  res.status(200).json(serverInfo);
});

// Handle 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Not Found - The requested resource does not exist'
    }
  });
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});