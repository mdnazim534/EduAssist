'use strict';

require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { initFirebase } = require('./config/firebase');
const { startCleanupScheduler } = require('./utils/cleanup');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ MongoDB connected');

    // Initialize Firebase Admin
    initFirebase();
    logger.info('✅ Firebase Admin initialized');

    // Start temp-file cleanup scheduler
    startCleanupScheduler();
    logger.info('✅ Cleanup scheduler started');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`✅ EduAssist API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
