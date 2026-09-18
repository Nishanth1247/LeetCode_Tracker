const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const activityRoutes = require('./routes/activityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const teamRoutes = require('./routes/teamRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const goalRoutes = require('./routes/goalRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const { testConnection } = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check API
app.get('/api/health', async (req, res) => {
  const isDbConnected = await testConnection();

  if (!isDbConnected) {
    return res.status(500).json({
      success: false,
      server: 'ok',
      database: 'disconnected',
      message: 'Database connection check failed.',
    });
  }

  return res.status(200).json({
    success: true,
    server: 'ok',
    database: 'connected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leetcode', leetcodeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

module.exports = app;
