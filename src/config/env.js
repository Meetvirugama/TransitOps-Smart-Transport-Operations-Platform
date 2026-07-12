require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}
if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

module.exports = env;
