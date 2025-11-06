const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./index');

async function connectDB(attempt = 0) {
  const maxAttempts = 3;
  try {
    logger.info('Attempting to connect to MongoDB...');
    
    if (!config.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set. Check .env file for MONGO_URI or MONGODB_URI.');
    }

    // Log sanitized URI (hide password)
    const sanitizedUri = config.MONGO_URI.replace(/:[^@]+@/, ':***@');
    logger.debug(`Using MongoDB URI: ${sanitizedUri}`);

    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      maxPoolSize: 10,
    });
    logger.info('MongoDB connected successfully');
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('error', (err) => logger.error('MongoDB error', err));
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt) * 1000;
      logger.info(`Retrying MongoDB connection in ${delay}ms (attempt ${attempt + 1})`);
      await new Promise((r) => setTimeout(r, delay));
      return connectDB(attempt + 1);
    }
    throw err;
  }
}

function closeDB() {
  return mongoose.connection.close();
}

module.exports = { connectDB, closeDB };
