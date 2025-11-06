// @ts-nocheck
// Bootstrap server for Bayader Bakery backend
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const config = require('./config');
const { connectDB, closeDB } = require('./config/db');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL === '*' ? true : config.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));
// Serve uploaded images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
if (config.NODE_ENV === 'development') app.use(morgan('dev'));

// Basic health and root routes
app.get('/api/health', (req, res) => res.json({ success: true, message: 'OK' }));
app.get('/api', (req, res) => res.json({ success: true, message: 'Bayader Bakery API' }));

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));
// Inventory routes (wraps product stock operations and inventory queries)
app.use('/api/inventory', require('./routes/inventory'));
// Dev-only debug routes (do not mount in production)
if (config.NODE_ENV === 'development') {
  app.use('/api/debug', require('./routes/debug'));
}

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    logger.info('Starting Bayader Bakery backend...');
    // Attempt DB connection
    try {
      await connectDB();
    } catch (err) {
      logger.warn('DB connection failed (continuing startup):', err.message);
    }

    const server = app.listen(config.PORT, () => {
      logger.info(`Server listening on port ${config.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      try {
        await closeDB();
      } catch (e) {
        logger.warn('Error during DB close:', e.message);
      }
      server.close(() => process.exit(0));
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
