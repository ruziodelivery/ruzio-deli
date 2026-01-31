/**
 * RUZIO - Order Routes
 * Customer order endpoints
 */

const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');
const { protect, authorize, orderValidation, mongoIdValidation } = require('../middleware');
const { ROLES } = require('../config/constants');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Customer routes
router.post(
  '/',
  authorize(ROLES.CUSTOMER),
  orderValidation,
  orderController.placeOrder
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

// Rate and review order
router.post(
  '/:id/rate',
  authorize(ROLES.CUSTOMER),
  mongoIdValidation,
  [
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters'),
    validate
  ],
  orderController.rateOrder
);

// Get single order (accessible by relevant parties)
router.get(
  '/:id',
  mongoIdValidation,
  orderController.getOrder
);

module.exports = router;