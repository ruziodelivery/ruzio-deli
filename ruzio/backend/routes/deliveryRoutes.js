/**
 * RUZIO - Delivery Routes
 * Delivery partner endpoints
 */

const express = require('express');
const router = express.Router();
const { deliveryController } = require('../controllers');
const { protect, authorize, checkApproved, mongoIdValidation } = require('../middleware');
const { ROLES } = require('../config/constants');

// All routes require delivery role
router.use(protect);
router.use(authorize(ROLES.DELIVERY));
router.use(checkApproved);

// Available orders
router.get('/available', deliveryController.getAvailableOrders);

// Accept order
router.put('/accept/:orderId', deliveryController.acceptDelivery);

// Current active delivery
router.get('/active', deliveryController.getActiveDelivery);

// Update delivery status
router.put('/status/:orderId', deliveryController.updateDeliveryStatus);

// Delivery history
router.get('/history', deliveryController.getDeliveryHistory);

// Statistics
router.get('/stats', deliveryController.getDeliveryStats);

module.exports = router;
