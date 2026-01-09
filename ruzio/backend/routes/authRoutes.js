/**
 * RUZIO - Auth Routes
 * Authentication endpoints
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect, registerValidation, loginValidation } = require('../middleware');

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
