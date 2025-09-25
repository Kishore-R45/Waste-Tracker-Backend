const WasteLog = require('../models/WasteLog');
const dayjs = require('dayjs');

// @desc    Create or update waste log
// @route   POST /api/waste-log
// @access  Private
const createOrUpdateWasteLog = async (req, res, next) => {
  try {
    const { plastic, organic, paper, glass, date } = req.body;
    const userId = req.user._id;
    
    // Use provided date or today
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    // Upsert waste log
    const wasteLog = await WasteLog.findOneAndUpdate(
      { userId, date: logDate },
      {
        $set: {
          plastic: plastic || 0,
          organic: organic || 0,
          paper: paper || 0,
          glass: glass || 0,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      wasteLog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get waste logs for a user
// @route   GET /api/waste-log/:userId
// @access  Public
const getWasteLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { start, end, date } = req.query;

    let query = { userId };

    if (date) {
      // Get specific date
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.date = {
        $gte: targetDate,
        $lt: nextDate
      };
      
      const log = await WasteLog.findOne(query);
      return res.status(200).json({
        success: true,
        log
      });
    }

    // Date range query
    if (start || end) {
      query.date = {};
      if (start) {
        query.date.$gte = new Date(start);
      }
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    const logs = await WasteLog.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete waste log
// @route   DELETE /api/waste-log/:logId
// @access  Private
const deleteWasteLog = async (req, res, next) => {
  try {
    const { logId } = req.params;
    const userId = req.user._id;

    const log = await WasteLog.findOneAndDelete({
      _id: logId,
      userId
    });

    if (!log) {
      return res.status(404).json({ message: 'Waste log not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Waste log deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateWasteLog,
  getWasteLogs,
  deleteWasteLog
};