/**
 * RUZIO - Routes Index
 * Export all routes from single entry point
 */

module.exports = {
  authRoutes: require('./authRoutes'),
  adminRoutes: require('./adminRoutes'),
  restaurantRoutes: require('./restaurantRoutes'),
  orderRoutes: require('./orderRoutes'),
  deliveryRoutes: require('./deliveryRoutes')
};
