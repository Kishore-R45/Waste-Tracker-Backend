const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin
} = require('../middleware/validation');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login); // ← THIS WAS THE ISSUE! It was not calling the actual login controller
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;