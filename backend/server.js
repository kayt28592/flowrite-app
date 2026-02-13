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

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Initialize defaults after DB connection
    await initializeDefaults();

    const app = require('./src/app');

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('================================================');
      console.log(`🚀 Flowrite API Server`);
      console.log(`📡 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api`);
      console.log('================================================');
      console.log('');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message, err.stack);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated!');
      });
    });
  } catch (error) {
    console.error('FAILED TO START SERVER:', error);
    process.exit(1);
  }
};

startServer();
