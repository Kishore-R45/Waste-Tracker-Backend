const express = require('express');
const router = express.Router();
const {
  getWasteStats,
  getSuggestions
} = require('../controllers/statsController');
const { validateStatsQuery } = require('../middleware/validation');

router.get('/:userId', validateStatsQuery, getWasteStats);
router.get('/suggestions/:userId', getSuggestions);

module.exports = router;