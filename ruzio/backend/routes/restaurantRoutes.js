/**
 * RUZIO - Restaurant Routes
 * Restaurant management endpoints
 */

const express = require('express');
const router = express.Router();
const { restaurantController } = require('../controllers');
const { 
  protect, 
  authorize, 
  checkApproved,
  restaurantValidation, 
  menuItemValidation,
  mongoIdValidation 
} = require('../middleware');
const { ROLES } = require('../config/constants');

// ============ PUBLIC ROUTES ============
router.get('/', restaurantController.getAllRestaurants);
router.get('/open', restaurantController.getOpenRestaurants);

// ============ PROTECTED SPECIFIC ROUTES (BEFORE PARAMETERIZED) ============
router.get(
  '/my-restaurant', 
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.getMyRestaurant
);

router.post(
  '/create',  // Using /create instead of / to avoid conflicts
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantValidation,
  restaurantController.createRestaurant
);

router.get(
  '/orders/list',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.getRestaurantOrders
);

router.get(
  '/stats/dashboard',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.getRestaurantStats
);

router.put(
  '/menu/:itemId',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.updateMenuItem
);

router.delete(
  '/menu/:itemId',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.deleteMenuItem
);

router.put(
  '/menu/:itemId/toggle',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.toggleItemAvailability
);

router.put(
  '/orders/:orderId/accept',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.acceptOrder
);

router.put(
  '/orders/:orderId/reject',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.rejectOrder
);

router.put(
  '/orders/:orderId/status',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.updateOrderStatus
);

// ============ PARAMETERIZED ROUTES (LAST) ============
// Public routes that take parameters
router.get('/:id', mongoIdValidation, restaurantController.getRestaurantById);
router.get('/:restaurantId/menu', restaurantController.getMenuItems);

// Protected parameterized routes
router.put(
  '/:id',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.updateRestaurant
);

router.put(
  '/:id/toggle-status',
  protect,
  authorize(ROLES.RESTAURANT),
  restaurantController.toggleOpenStatus
);

router.post(
  '/:restaurantId/menu',
  protect,
  authorize(ROLES.RESTAURANT),
  menuItemValidation,
  restaurantController.addMenuItem
);

module.exports = router;
