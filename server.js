const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

// Import database connections
const connectMongoDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const wasteLogRoutes = require('./routes/wasteLog');
const statsRoutes = require('./routes/stats');
const leaderboardRoutes = require('./routes/leaderboard');
const achievementsRoutes = require('./routes/achievements');
const exportRoutes = require('./routes/export');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import utils
const { updateAllUserScores } = require('./utils/scoring');

const app = express();

// Connect to Database
connectMongoDB();

// Middleware
app.use(helmet());

// Updated CORS configuration for multiple origins
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://waste-reduction-habit-tracker.netlify.app', // Your Netlify URL
  'https://your-vercel-app.vercel.app'    // Your Vercel frontend URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste-log', wasteLogRoutes);
app.use('/api/waste-stats', statsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Waste Tracker API is running',
    timestamp: new Date() 
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Cron job - only run in production
if (process.env.NODE_ENV === 'production') {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily score update...');
    await updateAllUserScores();
  });
}

const PORT = process.env.PORT || 5000;

// For Vercel, we export the app instead of listening
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;