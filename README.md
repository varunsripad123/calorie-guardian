# Calorie Guardian

![Calorie Guardian App](https://github.com/user-attachments/assets/a609bee8-f588-466d-9d40-2a0d89b59946)

A comprehensive calorie and nutrition tracking application powered by AI to help you maintain a healthy lifestyle.

## Features

- 🍔 **Food Tracking**: Log your meals and track your daily nutrition
- 🤖 **AI-Powered Analysis**: Get accurate nutrition information for any food using OpenAI
- 📊 **Nutrition Insights**: Visualize your nutritional intake with charts and summaries
- 🍽️ **Meal Planning**: Generate personalized meal plans based on your goals
- 👨‍🍳 **Recipe Generation**: Create recipes from ingredients you have on hand
- 👤 **User Profiles**: Personalized experience based on your health goals

## Project Structure

This project consists of two main parts:

1. **Frontend**: React application with TypeScript and Tailwind CSS
2. **Backend**: Node.js API server with Express, MongoDB, and OpenAI integration

## Technologies Used

### Frontend
- **Vite**: Fast build tool and development server
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable component library
- **Recharts**: Charting library for data visualization

### Backend
- **Node.js** with **Express.js**: Server framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB** with **Mongoose**: Database
- **OpenAI API**: AI-powered food analysis and nutrition advice
- **JWT**: Authentication

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB database
- OpenAI API key

### Frontend Setup

```sh
# Clone the repository
git clone https://github.com/varunsripad123/calorie-guardian.git

# Navigate to the project directory
cd calorie-guardian

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Backend Setup

```sh
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and OpenAI API key

# Start the development server
npm run dev
```

## Development

### Frontend
- **Development server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

### Backend
- **Development server**: `npm run dev`
- **Build**: `npm run build`
- **Start production server**: `npm start`

## API Endpoints

The backend provides various API endpoints for user authentication, food tracking, and AI features. See the [Server README](./server/README.md) for full API documentation.

## License

This project is licensed under the [MIT License](LICENSE).
