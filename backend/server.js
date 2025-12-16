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
app.use('/api/users', require('./routes/users'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/events', require('./routes/events'));
app.use('/api/event-bookings', require('./routes/eventBookingRoutes'));
app.use('/api/custom-orders', require('./routes/customOrderRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/drivers', require('./routes/drivers'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/inventory-alerts', require('./routes/inventoryAlerts'));
app.use('/api/production', require('./routes/production'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notifications', require('./routes/notifications'));
// Materials management routes (for material-based inventory)
app.use('/api/materials', require('./routes/materials'));
// Inventory routes (wraps product stock operations and inventory queries)
app.use('/api/inventory', require('./routes/inventory'));

// CRITICAL SAFETY CHECK: Prevent /api/* from ever returning HTML
app.use('/api', (req, res) => {
  console.log('[SAFETY-CHECK] ❌ API route not found:', { method: req.method, path: req.path, url: req.url });
  res.set('Content-Type', 'application/json');
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.path,
    method: req.method,
    data: null
  });
});

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

    // Create HTTP server and attach Socket.IO
    const http = require('http');
    const { Server } = require('socket.io');
    const jwt = require('jsonwebtoken');

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: config.FRONTEND_URL === '*' ? true : config.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });

    // Expose simple helper to emit notifications to specific user rooms
    app.set('socketHelpers', {
      emitNotification: (userId, payload) => {
        try {
          io.to(userId.toString()).emit('notification', payload);
        } catch (e) {
          logger.warn('Failed to emit notification', e.message);
        }
      }
    });

    io.on('connection', (socket) => {
      try {
        const token = socket.handshake.auth?.token;
        if (token) {
          try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            const uid = decoded.id || decoded._id;
            if (uid) {
              socket.join(uid.toString());
              console.log('[SOCKET] User joined room:', uid.toString());
            }
          } catch (e) {
            console.log('[SOCKET] Token verify failed for socket connection:', e.message);
          }
        }

        socket.on('disconnect', (reason) => {
          console.log('[SOCKET] Disconnected:', socket.id, reason);
        });
      } catch (err) {
        console.error('[SOCKET] Connection handler error:', err);
      }
    });

    server.listen(config.PORT, () => {
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
