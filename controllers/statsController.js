const WasteLog = require('../models/WasteLog');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

// @desc    Get waste statistics for a user
// @route   GET /api/waste-stats/:userId
// @access  Public
const getWasteStats = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { range = '7' } = req.query;
    
    const days = parseInt(range);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    
    // Get current period data
    const currentPeriodLogs = await WasteLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPlastic: { $sum: '$plastic' },
          totalOrganic: { $sum: '$organic' },
          totalPaper: { $sum: '$paper' },
          totalGlass: { $sum: '$glass' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get previous period data for comparison
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - days + 1);

    const previousPeriodLogs = await WasteLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPlastic: { $sum: '$plastic' },
          totalOrganic: { $sum: '$organic' },
          totalPaper: { $sum: '$paper' },
          totalGlass: { $sum: '$glass' }
        }
      }
    ]);

    // Get daily data for charts
    const dailyData = await WasteLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          date: 1,
          plastic: 1,
          organic: 1,
          paper: 1,
          glass: 1,
          total: { $add: ['$plastic', '$organic', '$paper', '$glass'] }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Calculate totals and comparisons
    const current = currentPeriodLogs[0] || {
      totalPlastic: 0,
      totalOrganic: 0,
      totalPaper: 0,
      totalGlass: 0,
      count: 0
    };

    const previous = previousPeriodLogs[0] || {
      totalPlastic: 0,
      totalOrganic: 0,
      totalPaper: 0,
      totalGlass: 0
    };

    // Calculate reduction percentages
    const calculateReduction = (prev, curr) => {
      if (prev === 0) return curr === 0 ? 0 : -100;
      return ((prev - curr) / prev) * 100;
    };

    const reductionPercent = calculateReduction(
      previous.totalPlastic + previous.totalOrganic + previous.totalPaper + previous.totalGlass,
      current.totalPlastic + current.totalOrganic + current.totalPaper + current.totalGlass
    );

    // Find best and worst categories
    const categories = [
      { name: 'plastic', current: current.totalPlastic, previous: previous.totalPlastic },
      { name: 'organic', current: current.totalOrganic, previous: previous.totalOrganic },
      { name: 'paper', current: current.totalPaper, previous: previous.totalPaper },
      { name: 'glass', current: current.totalGlass, previous: previous.totalGlass }
    ];

    categories.forEach(cat => {
      cat.reduction = calculateReduction(cat.previous, cat.current);
    });

    const bestCategory = categories.reduce((best, cat) => 
      cat.reduction > best.reduction ? cat : best
    ).name;

    const worstCategory = categories.reduce((worst, cat) => 
      cat.reduction < worst.reduction ? cat : worst
    ).name;

    // Calculate streak
    const streak = current.count;

    res.status(200).json({
      success: true,
      totals: {
        plastic: current.totalPlastic,
        organic: current.totalOrganic,
        paper: current.totalPaper,
        glass: current.totalGlass
      },
      comparison: {
        plastic: calculateReduction(previous.totalPlastic, current.totalPlastic),
        organic: calculateReduction(previous.totalOrganic, current.totalOrganic),
        paper: calculateReduction(previous.totalPaper, current.totalPaper),
        glass: calculateReduction(previous.totalGlass, current.totalGlass)
      },
      reductionPercent,
      bestCategory,
      worstCategory,
      streak,
      dailyData,
      totalWaste: current.totalPlastic + current.totalOrganic + current.totalPaper + current.totalGlass,
      activeDays: current.count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get eco tips/suggestions for a user
// @route   GET /api/suggestions/:userId
// @access  Public
const getSuggestions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Get last 7 days of waste data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const weeklyTotals = await WasteLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPlastic: { $sum: '$plastic' },
          totalOrganic: { $sum: '$organic' },
          totalPaper: { $sum: '$paper' },
          totalGlass: { $sum: '$glass' }
        }
      }
    ]);

    const totals = weeklyTotals[0] || {
      totalPlastic: 0,
      totalOrganic: 0,
      totalPaper: 0,
      totalGlass: 0
    };

    // Generate suggestions based on waste amounts
    const suggestions = [];

    if (totals.totalPlastic > 2) {
      suggestions.push({
        category: 'plastic',
        text: 'Your plastic waste is high. Try using reusable bags and water bottles.',
        priority: 1
      });
    }

    if (totals.totalOrganic > 5) {
      suggestions.push({
        category: 'organic',
        text: 'Consider composting your organic waste to reduce landfill impact.',
        priority: 1
      });
    }

    if (totals.totalPaper > 3) {
      suggestions.push({
        category: 'paper',
        text: 'Go digital! Reduce paper usage by switching to electronic documents.',
        priority: 2
      });
    }

    if (totals.totalGlass > 2) {
      suggestions.push({
        category: 'glass',
        text: 'Reuse glass containers for storage instead of throwing them away.',
        priority: 2
      });
    }

    // Add general tips if no specific issues
    if (suggestions.length === 0) {
      suggestions.push({
        category: 'general',
        text: 'Great job! Keep tracking your waste to maintain awareness.',
        priority: 3
      });
    }

    res.status(200).json({
      success: true,
      suggestions: suggestions.slice(0, 3) // Return top 3 suggestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWasteStats,
  getSuggestions
};