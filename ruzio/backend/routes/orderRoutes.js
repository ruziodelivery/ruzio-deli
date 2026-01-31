/**
 * RUZIO - Order Routes
 * Customer order endpoints
 */

const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');
const { protect, authorize, orderValidation, mongoIdValidation } = require('../middleware');
const { ROLES } = require('../config/constants');

// All routes require authentication
router.use(protect);

// Customer routes
router.post(
  '/',
  authorize(ROLES.CUSTOMER),
  orderValidation,
  orderController.placeOrder
);

router.post(
  '/estimate',
  authorize(ROLES.CUSTOMER),
  orderController.getOrderEstimate
);

router.get(
  '/my-orders',
  authorize(ROLES.CUSTOMER),
  orderController.getMyOrders
);

router.put(
  '/:id/cancel',
  authorize(ROLES.CUSTOMER),
  mongoIdValidation,
  orderController.cancelOrder
);

// Get single order (accessible by relevant parties)
router.get(
  '/:id',
  mongoIdValidation,
  orderController.getOrder
);

module.exports = router;
