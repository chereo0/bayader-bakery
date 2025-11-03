const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend folder by default
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Support multiple common env var names (MONGO_URI or MONGODB_URI, FRONTEND_URL or CORS_ORIGIN)
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*';

const required = ['JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env variables: ${missing.join(', ')}`);
  if (process.env.NODE_ENV !== 'test') process.exit(1);
}

module.exports = {
  MONGO_URI,
  PORT: Number(process.env.PORT || 5000),
  JWT_SECRET: process.env.JWT_SECRET || 'changeme',
  FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOW_STOCK_THRESHOLD: Number(process.env.LOW_STOCK_THRESHOLD || 5)
};
