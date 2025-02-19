import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  openAiKey: process.env.OPENAI_API_KEY,
  tavilyKey: process.env.TAVILY_API_KEY,
  langSmithKey: process.env.LANGSMITH_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'TAVILY_API_KEY', 'LANGSMITH_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config; 