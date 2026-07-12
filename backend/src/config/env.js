require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  // Groq API keys for rotation (up to 4)
  groqApiKeys: [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter(Boolean), // filter out any undefined/empty keys
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}
if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

module.exports = env;
