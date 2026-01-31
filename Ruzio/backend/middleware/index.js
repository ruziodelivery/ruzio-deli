/**
 * RUZIO - Middleware Index
 * Export all middleware from single entry point
 */

module.exports = {
  ...require('./auth'),
  ...require('./errorHandler'),
  ...require('./validation')
};
