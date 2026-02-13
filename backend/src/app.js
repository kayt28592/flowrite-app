/**
 * Express Application Configuration
 * Main app setup with middleware and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const submissionRoutes = require('./routes/submission.routes');
const docketRoutes = require('./routes/docket.routes');
const itemRoutes = require('./routes/item.routes');

// Initialize express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security headers
app.use(helmet());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Rate limiting - TEMPORARILY DISABLED FOR TESTING
// const limiter = rateLimit({
//   windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
//   max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000,
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api/', limiter);

// ============================================
// GENERAL MIDDLEWARE
// ============================================

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', async (req, res) => {
  let dbStatus = 'Disconnected';
  try {
    const { mongoose } = require('./config/database'); // Actually it's exported differently
    const state = require('mongoose').connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    dbStatus = states[state] || 'Unknown';
  } catch (e) {
    dbStatus = 'Error checking DB';
  }

  res.status(200).json({
    success: true,
    message: 'Flowrite API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: dbStatus
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dockets', docketRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/job-forms', require('./routes/jobForm.routes'));
app.use('/api/form-templates', require('./routes/formTemplateRoutes'));
app.use('/api/dynamic-submissions', require('./routes/dynamicSubmissionRoutes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/timesheets', require('./routes/timesheet.routes'));
app.use('/api/settings', require('./routes/systemSetting.routes'));

// API documentation
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Flowrite API v1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      submissions: '/api/submissions',
      dockets: '/api/dockets',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
