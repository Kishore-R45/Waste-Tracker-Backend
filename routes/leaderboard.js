const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

// Make protect optional to allow public viewing
router.get('/', (req, res, next) => {
  // Try to authenticate but don't require it
  protect(req, res, (err) => {
    if (err) req.user = null;
    next();
  });
}, getLeaderboard);

module.exports = router;