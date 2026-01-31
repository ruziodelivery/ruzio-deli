/**
 * RUZIO - Controllers Index
 * Export all controllers from single entry point
 */

module.exports = {
  authController: require('./authController'),
  adminController: require('./adminController'),
  restaurantController: require('./restaurantController'),
  orderController: require('./orderController'),
  deliveryController: require('./deliveryController')
};
