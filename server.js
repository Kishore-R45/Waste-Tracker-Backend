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
// const connectMySQL = require('./config/mysql'); // Uncomment if using MySQL

// Import routes
const authRoutes = require('./routes/auth');
const wasteLogRoutes = require('./routes/wasteLog');
const statsRoutes = require('./routes/stats');
const leaderboardRoutes = require('./routes/leaderboard');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import utils
const { updateAllUserScores } = require('./utils/scoring');

const app = express();
app.get('/', (req, res) => {
  res.json({ message: 'Waste Tracker API is running!' });
});


// Connect to Database
connectMongoDB();
// connectMySQL(); // Uncomment if using MySQL

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.set('trust proxy', 1); // trust first proxy
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

// Achievements route (bonus)
app.use('/api/achievements', require('./routes/achievements'));

// Export route
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Cron job to update user scores daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily score update...');
  await updateAllUserScores();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;