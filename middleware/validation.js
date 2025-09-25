const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Waste log validations
const validateWasteLog = [
  body('plastic').isFloat({ min: 0 }).withMessage('Plastic must be a positive number'),
  body('organic').isFloat({ min: 0 }).withMessage('Organic must be a positive number'),
  body('paper').isFloat({ min: 0 }).withMessage('Paper must be a positive number'),
  body('glass').isFloat({ min: 0 }).withMessage('Glass must be a positive number'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  validate
];

// Stats validations
const validateStatsQuery = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  query('range').optional().isIn(['7', '30', '90']).withMessage('Range must be 7, 30, or 90'),
  validate
];

module.exports = {
  validateRegister,
  validateLogin,
  validateWasteLog,
  validateStatsQuery
};