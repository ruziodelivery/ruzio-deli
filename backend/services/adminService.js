/**
 * RUZIO - Admin Service
 * Business logic for admin operations
 */

const { User, PlatformSettings, Order, Restaurant } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { ROLES, ORDER_STATUS } = require('../config/constants');

/**
 * Get platform settings
 */
const getSettings = async () => {
  return await PlatformSettings.getSettings();
};

/**
 * Update platform settings
 */
const updateSettings = async (settingsData, adminId) => {
  let settings = await PlatformSettings.findOne();
  
  if (!settings) {
    settings = new PlatformSettings();
  }

  // Update allowed fields
  if (settingsData.commissionPercentage !== undefined) {
    settings.commissionPercentage = settingsData.commissionPercentage;
  }
  if (settingsData.baseDeliveryCharge !== undefined) {
    settings.baseDeliveryCharge = settingsData.baseDeliveryCharge;
  }
  if (settingsData.perKmRate !== undefined) {
    settings.perKmRate = settingsData.perKmRate;
  }

  settings.updatedBy = adminId;
  await settings.save();

  return settings;
};

/**
 * Get all users with filters
 */
const getAllUsers = async (filters = {}) => {
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  if (filters.isApproved !== undefined) {
    query.isApproved = filters.isApproved;
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 });

  return users;
};

/**
 * Approve a user (restaurant/delivery)
 */
const approveUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (user.role === ROLES.ADMIN) {
    throw new ApiError('Cannot modify admin users', 400);
  }

  user.isApproved = true;
  await user.save();

  return user;
};

/**
 * Block/Unblock a user
 */
const toggleUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (user.role === ROLES.ADMIN) {
    throw new ApiError('Cannot modify admin users', 400);
  }

  user.isActive = isActive;
  await user.save();

  return user;
};

/**
 * Get all orders for admin view
 */
const getAllOrders = async (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  const orders = await Order.find(query)
    .populate('customer', 'name email')
    .populate('restaurant', 'name')
    .populate('deliveryPartner', 'name')
    .sort({ createdAt: -1 });

  return orders;
};

/**
 * Get platform earnings statistics
 */
const getPlatformEarnings = async () => {
  // Get all delivered orders
  const deliveredOrders = await Order.find({ status: ORDER_STATUS.DELIVERED });

  const stats = {
    totalOrders: deliveredOrders.length,
    totalRevenue: 0,
    totalCommission: 0,
    totalDeliveryCharges: 0
  };

  deliveredOrders.forEach(order => {
    stats.totalRevenue += order.totalAmount;
    stats.totalCommission += order.adminCommission;
    stats.totalDeliveryCharges += order.deliveryCharge;
  });

  // Get order counts by status
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  stats.ordersByStatus = ordersByStatus.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Get restaurant count
  stats.totalRestaurants = await Restaurant.countDocuments();
  stats.activeRestaurants = await Restaurant.countDocuments({ isOpen: true, isApproved: true });

  // Get user counts
  stats.totalCustomers = await User.countDocuments({ role: ROLES.CUSTOMER });
  stats.totalDeliveryPartners = await User.countDocuments({ role: ROLES.DELIVERY });

  return stats;
};

/**
 * Get all restaurants for admin
 */
const getAllRestaurants = async () => {
  const restaurants = await Restaurant.find()
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  return restaurants;
};

/**
 * Approve a restaurant
 */
const approveRestaurant = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  
  if (!restaurant) {
    throw new ApiError('Restaurant not found', 404);
  }

  restaurant.isApproved = true;
  await restaurant.save();

  return restaurant;
};

module.exports = {
  getSettings,
  updateSettings,
  getAllUsers,
  approveUser,
  toggleUserStatus,
  getAllOrders,
  getPlatformEarnings,
  getAllRestaurants,
  approveRestaurant
};
