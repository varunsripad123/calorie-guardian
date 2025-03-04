# Calorie Guardian - Backend API

This is the backend API for the Calorie Guardian application, a comprehensive nutrition tracking and meal planning app powered by AI.

## Features

- **User Authentication**: Register, login, and profile management
- **Nutrition Tracking**: Record, track, and analyze daily food intake
- **AI-Powered Analysis**: Analyze food items, get personalized nutrition advice
- **Meal Planning**: Generate custom meal plans based on user preferences
- **Recipe Creation**: Generate recipes from available ingredients

## Tech Stack

- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** for data storage
- **JSON Web Tokens (JWT)** for authentication
- **OpenAI API** for AI-powered features

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/apikey` - Save OpenAI API key

### User Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Food & Nutrition

- `POST /api/food` - Add food item
- `GET /api/food` - Get food items for a specific date
- `DELETE /api/food/:id` - Delete a food item
- `GET /api/food/summary` - Get nutrition summary for date range

### OpenAI Features

- `POST /api/openai/analyze-food` - Analyze food item
- `POST /api/openai/nutrition-advice` - Get nutrition advice
- `POST /api/openai/meal-plan` - Generate meal plan
- `POST /api/openai/recipe` - Generate recipe

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB database
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd calorie-guardian/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your MongoDB URI, JWT secret, and other required variables.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- **Run tests**: `npm test`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `NODE_ENV` - Environment (development, production)
- `OPENAI_API_KEY` - OpenAI API key (fallback only)

## License

[MIT License](LICENSE)