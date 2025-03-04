import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// This creates an OpenAI configuration with the API key from environment
// We'll use a custom handler for user-provided API keys in the controllers
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Fallback API key
});

export default openai;