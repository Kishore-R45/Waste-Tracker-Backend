const express = require('express');
const router = express.Router();
const {
  createOrUpdateWasteLog,
  getWasteLogs,
  deleteWasteLog
} = require('../controllers/wasteController');
const { protect } = require('../middleware/auth');
const { validateWasteLog } = require('../middleware/validation');

router.post('/', protect, validateWasteLog, createOrUpdateWasteLog);
router.get('/:userId', getWasteLogs);
router.delete('/:logId', protect, deleteWasteLog);

module.exports = router;