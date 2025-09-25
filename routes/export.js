const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const WasteLog = require('../models/WasteLog');

router.get('/user-data', protect, async (req, res) => {
  try {
    const logs = await WasteLog.find({ userId: req.user._id }).sort({ date: -1 });
    
    // Convert to CSV
    const csvHeader = 'Date,Plastic,Organic,Paper,Glass,Total\n';
    const csvData = logs.map(log => {
      const total = log.plastic + log.organic + log.paper + log.glass;
      return `${log.date},${log.plastic},${log.organic},${log.paper},${log.glass},${total}`;
    }).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=waste-data.csv');
    res.send(csvHeader + csvData);
  } catch (error) {
    res.status(500).json({ message: 'Export failed' });
  }
});

module.exports = router;