const User = require('../models/User');
const WasteLog = require('../models/WasteLog');
const mongoose = require('mongoose');

const calculateUserScore = async (userId) => {
  try {
    // Get last 7 days data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Get previous 7 days for comparison
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - 7);

    // Current week totals
    const currentWeek = await WasteLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          plastic: { $sum: '$plastic' },
          organic: { $sum: '$organic' },
          paper: { $sum: '$paper' },
          glass: { $sum: '$glass' }
        }
      }
    ]);

    // Previous week totals
    const previousWeek = await WasteLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
      {
        $group: {
          _id: null,
          plastic: { $sum: '$plastic' },
          organic: { $sum: '$organic' },
          paper: { $sum: '$paper' },
          glass: { $sum: '$glass' }
        }
      }
    ]);

    if (!currentWeek[0] || !previousWeek[0]) {
      return 50; // Default score for new users
    }

    const curr = currentWeek[0];
    const prev = previousWeek[0];

    // Calculate reduction percentage for each category
    const calculateReduction = (previous, current) => {
      if (previous === 0) return current === 0 ? 0 : -100;
      return ((previous - current) / previous) * 100;
    };

    // Weighted scoring (plastic has higher weight due to environmental impact)
    const weights = {
      plastic: 0.4,
      organic: 0.2,
      paper: 0.2,
      glass: 0.2
    };

    const plasticReduction = calculateReduction(prev.plastic, curr.plastic);
    const organicReduction = calculateReduction(prev.organic, curr.organic);
    const paperReduction = calculateReduction(prev.paper, curr.paper);
    const glassReduction = calculateReduction(prev.glass, curr.glass);

    // Calculate weighted score
    const weightedScore = 
      weights.plastic * plasticReduction +
      weights.organic * organicReduction +
      weights.paper * paperReduction +
      weights.glass * glassReduction;

    // Normalize to 0-100 scale
    const normalizedScore = Math.max(0, Math.min(100, 50 + (weightedScore / 2)));

    return Math.round(normalizedScore);
  } catch (error) {
    console.error('Error calculating user score:', error);
    return 0;
  }
};

const updateAllUserScores = async () => {
  try {
    const users = await User.find();
    
    for (const user of users) {
      const score = await calculateUserScore(user._id);
      user.reductionScore = score;
      await user.save();
    }
    
    console.log(`Updated scores for ${users.length} users`);
  } catch (error) {
    console.error('Error updating user scores:', error);
  }
};

module.exports = {
  calculateUserScore,
  updateAllUserScores
};