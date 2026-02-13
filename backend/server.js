/**
 * Server Entry Point
 * Starts the Express server and connects to database
 */

// Load environment variables
const path = require('path');
const fs = require('fs');

// In development, prioritize .env.dev if it exists
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '.env.dev');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  } else {
    require('dotenv').config();
  }
} else {
  // In production (Railway/Render etc), env vars are usually injected directly
  require('dotenv').config();
}

const { connectDB } = require('./src/config/database');
const { initializeDefaults } = require('./src/controllers/systemSetting.controller');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require('./src/app');

// Start server immediately to satisfy platform health checks
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  });

  try {
    // Connect to database asynchronously
    await connectDB();
    console.log('✅ MongoDB Connected Successfully');

    // Initialize defaults after DB connection
    await initializeDefaults();
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    // Do NOT exit process, keep server alive for health checks
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('💤 Process terminated!');
    });
  });
};

// Start logic
if (process.env.VERCEL) {
  // Vercel handles start automatically
  connectDB().then(() => initializeDefaults());
} else {
  startServer();
}

// Export app for Vercel
module.exports = app;
