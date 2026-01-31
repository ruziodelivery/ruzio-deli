/**
 * RUZIO - Food Delivery Platform
 * Application Constants
 */

module.exports = {
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    RESTAURANT: 'restaurant',
    DELIVERY: 'delivery',
    CUSTOMER: 'customer'
  },

  // Order Status Flow
  ORDER_STATUS: {
    PENDING: 'pending',           // Order placed, waiting for restaurant
    ACCEPTED: 'accepted',         // Restaurant accepted
    REJECTED: 'rejected',         // Restaurant rejected
    PREPARING: 'preparing',       // Restaurant is preparing
    READY: 'ready',               // Ready for pickup
    ASSIGNED: 'assigned',         // Delivery partner assigned
    PICKED_UP: 'picked_up',       // Delivery partner picked up
    DELIVERED: 'delivered',       // Order delivered
    CANCELLED: 'cancelled'        // Order cancelled
  },

  // Default Platform Settings
  DEFAULT_SETTINGS: {
    commissionPercentage: 10,     // 10% commission
    baseDeliveryCharge: 20,       // Base delivery fee
    perKmRate: 5                  // Per km rate
  }
};
