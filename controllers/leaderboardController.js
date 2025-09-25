const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all users sorted by reduction score
    const allUsers = await User.find()
      .select('name email reductionScore createdAt')
      .sort({ reductionScore: -1 });

    // Get paginated results
    const leaderboard = await User.find()
      .select('name email reductionScore createdAt')
      .sort({ reductionScore: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total user count
    const totalUsers = await User.countDocuments();

    // Add rank to each user
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));

    // If user is authenticated, get their rank
    let userRank = null;
    if (req.user) {
      // Find user's position in all users
      const userIndex = allUsers.findIndex(u => u._id.toString() === req.user._id.toString());
      
      if (userIndex !== -1) {
        userRank = {
          rank: userIndex + 1,
          score: req.user.reductionScore || 0,
          totalUsers
        };
      }
    }

    res.status(200).json({
      success: true,
      leaderboard: leaderboardWithRank,
      userRank,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / parseInt(limit)),
      totalUsers
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    next(error);
  }
};

module.exports = {
  getLeaderboard
};