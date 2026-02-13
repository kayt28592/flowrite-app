/**
 * Logger Utility
 * Production-grade logging with Winston
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { LOG_LEVELS, ENV } = require('../constants');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (human-readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logs directory if it doesn't exist
// Use dev_logs in development to avoid permission issues with previous runs
const logsDir = process.env.NODE_ENV === 'development'
  ? path.join(__dirname, '../../dev_logs')
  : path.join(__dirname, '../../logs');

// Transport configurations
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== ENV.PRODUCTION) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: LOG_LEVELS.DEBUG,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: LOG_LEVELS.INFO,
    })
  );
}

// File transports - only for production to avoid local permission issues
if (process.env.NODE_ENV === ENV.PRODUCTION) {
  // File transport for errors
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: LOG_LEVELS.ERROR,
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    })
  );

  // File transport for combined logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || LOG_LEVELS.INFO,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Helper methods
logger.logRequest = (req) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

logger.logResponse = (req, res, duration) => {
  logger.info('HTTP Response', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
  });
};

logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.url,
      ip: req.ip,
    }),
  };
  logger.error('Application Error', errorLog);
};

logger.logDbOperation = (operation, collection, duration) => {
  logger.debug('Database Operation', {
    operation,
    collection,
    duration: `${duration}ms`,
  });
};

if (process.env.NODE_ENV === ENV.PRODUCTION) {
  // Handle uncaught exceptions
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions_v2.log'),
    })
  );

  // Handle unhandled promise rejections
  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections_v2.log'),
    })
  );
}

module.exports = logger;
