
/**
 * RUZIO - Auth Routes
 * Authentication endpoints with OTP support
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect, registerValidation, loginValidation } = require('../middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

// OTP-based authentication
router.post('/request-otp', [
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  validate
], authController.requestOTP);

router.post('/verify-otp', [
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validate
], authController.verifyOTP);

// Legacy routes (for testing/fallback)
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
