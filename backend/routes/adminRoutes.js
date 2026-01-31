/**
 * RUZIO - Admin Routes
 * Admin-only endpoints
 */

const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { protect, authorize, settingsValidation, mongoIdValidation } = require('../middleware');
const { ROLES } = require('../config/constants');

// All routes require admin role
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Platform settings
router.get('/settings', adminController.getSettings);
router.put('/settings', settingsValidation, adminController.updateSettings);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/approve', mongoIdValidation, adminController.approveUser);
router.put('/users/:id/block', mongoIdValidation, adminController.blockUser);
router.put('/users/:id/unblock', mongoIdValidation, adminController.unblockUser);

// Restaurant management
router.get('/restaurants', adminController.getAllRestaurants);
router.put('/restaurants/:id/approve', mongoIdValidation, adminController.approveRestaurant);

// Orders & earnings
router.get('/orders', adminController.getAllOrders);
router.get('/earnings', adminController.getEarnings);

module.exports = router;
