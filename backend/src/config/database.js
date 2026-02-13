/**
 * Database Configuration
 * Production-grade MongoDB connection with pooling and monitoring
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { ENV } = require('../constants');

// MongoDB connection options
const options = {
  // Connection pool settings
  maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 10,
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,

  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,

  // Retry settings
  retryWrites: true,
  retryReads: true,

  // Auto index creation
  autoIndex: process.env.NODE_ENV === ENV.DEVELOPMENT,

  // Buffer commands
  bufferCommands: false,
};

// Connection state tracking
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
  try {
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    logger.info('Attempting to connect to MongoDB...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info('✅ MongoDB Connected Successfully', {
      host: conn.connection.host,
      database: conn.connection.name,
      port: conn.connection.port,
      poolSize: options.maxPoolSize,
    });

    // Reset connection attempts on success
    connectionAttempts = 0;

    // Setup event listeners
    setupEventListeners();

    // Setup monitoring
    if (process.env.NODE_ENV === ENV.PRODUCTION) {
      setupMonitoring();
    }

    return conn;
  } catch (error) {
    connectionAttempts++;
    logger.error('❌ MongoDB Connection Failed', {
      attempt: connectionAttempts,
      error: error.message,
    });

    // Retry logic
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      logger.warn(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB();
    } else {
      logger.error('Max retry attempts reached. Exiting process.');
      process.exit(1);
    }
  }
};

/**
 * Setup MongoDB event listeners
 */
const setupEventListeners = () => {
  // Connection events
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected successfully');
  });

  mongoose.connection.on('close', () => {
    logger.info('MongoDB connection closed');
  });

  // Query monitoring in development
  if (process.env.NODE_ENV === ENV.DEVELOPMENT) {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug('MongoDB Query', {
        collection: collectionName,
        method,
        query: JSON.stringify(query),
      });
    });
  }
};

/**
 * Setup production monitoring
 */
const setupMonitoring = () => {
  // Monitor connection pool
  const monitoringInterval = setInterval(() => {
    try {
      // Safely access pool stats with proper error handling
      const connection = mongoose.connection;

      if (connection && connection.readyState === 1) {
        // Connection is active, try to get pool stats
        const db = connection.db;

        if (db && db.serverConfig) {
          // Different versions of MongoDB driver have different structures
          const serverConfig = db.serverConfig;
          let poolStats = null;

          // Try different possible paths for pool stats
          if (serverConfig.s && serverConfig.s.pool) {
            poolStats = serverConfig.s.pool;
          } else if (serverConfig.topology && serverConfig.topology.s && serverConfig.topology.s.pool) {
            poolStats = serverConfig.topology.s.pool;
          }

          if (poolStats) {
            logger.debug('MongoDB Connection Pool Stats', {
              availableConnections: poolStats.availableConnections?.length || 0,
              usedConnections: poolStats.usedConnections?.length || 0,
              waitQueueSize: poolStats.waitQueueSize || 0,
            });
          }
        }
      }
    } catch (error) {
      // Silently ignore monitoring errors
      logger.debug('Could not retrieve pool stats', { error: error.message });
    }
  }, 60000); // Log every minute

  // Clear interval on connection close
  mongoose.connection.on('close', () => {
    clearInterval(monitoringInterval);
  });

  // Monitor query performance
  mongoose.plugin((schema) => {
    schema.pre(/^find/, function () {
      this._startTime = Date.now();
    });

    schema.post(/^find/, function () {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        if (duration > 1000) {
          // Log slow queries (>1s)
          logger.warn('Slow Query Detected', {
            collection: this.mongooseCollection.name,
            duration: `${duration}ms`,
          });
        }
      }
    });
  });
};

/**
 * Gracefully close database connection
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error('Error closing MongoDB connection', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Check database health
 */
const checkHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state],
      database: mongoose.connection.name,
      host: mongoose.connection.host,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Closing MongoDB connection...`);
  try {
    await closeDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: error.message });
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

module.exports = {
  connectDB,
  closeDB,
  checkHealth,
};
