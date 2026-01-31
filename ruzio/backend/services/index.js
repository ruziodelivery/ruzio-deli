/**
 * RUZIO - Services Index
 * Export all services from single entry point
 */

module.exports = {
  authService: require('./authService'),
  adminService: require('./adminService'),
  restaurantService: require('./restaurantService'),
  orderService: require('./orderService'),
  deliveryService: require('./deliveryService')
};
