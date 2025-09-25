const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/:userId', async (req, res) => {
  try {
    // Sample achievements - in production, fetch from database
    const achievements = [
      {
        name: 'First Step',
        description: 'Logged your first waste entry',
        icon: '🌱',
        unlocked: true
      },
      {
        name: 'Week Warrior',
        description: 'Logged waste for 7 consecutive days',
        icon: '📅',
        unlocked: false
      },
      {
        name: 'Eco Champion',
        description: 'Achieved reduction score of 80+',
        icon: '🏆',
        unlocked: false
      }
    ];

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;