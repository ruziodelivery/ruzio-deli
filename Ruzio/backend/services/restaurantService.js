/**
 * RUZIO - Restaurant Service
 * Business logic for restaurant operations
 */

const { Restaurant, MenuItem, Order, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { ORDER_STATUS, ROLES } = require('../config/constants');

/**
 * Create restaurant profile
 */
const createRestaurant = async (restaurantData, ownerId) => {
  // Check if owner already has a restaurant
  const existingRestaurant = await Restaurant.findOne({ owner: ownerId });
  if (existingRestaurant) {
    throw new ApiError('You already have a restaurant profile', 400);
  }

  const restaurant = await Restaurant.create({
    ...restaurantData,
    owner: ownerId
  });

  return restaurant;
};

/**
 * Get restaurant by owner
 */
const getRestaurantByOwner = async (ownerId) => {
  const restaurant = await Restaurant.findOne({ owner: ownerId });
  if (!restaurant) {
    throw new ApiError('Restaurant not found. Please create your restaurant profile.', 404);
  }
  return restaurant;
};

/**
 * Get restaurant by ID (public)
 */
const getRestaurantById = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId)
    .populate('owner', 'name email phone');
  
  if (!restaurant) {
    throw new ApiError('Restaurant not found', 404);
  }
  return restaurant;
};

/**
 * Update restaurant profile
 */
const updateRestaurant = async (restaurantId, updateData, ownerId) => {
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: ownerId });
  
  if (!restaurant) {
    throw new ApiError('Restaurant not found or unauthorized', 404);
  }

  // Prevent updating certain fields
  delete updateData.owner;
  delete updateData.isApproved;
  delete updateData.totalOrders;
  delete updateData.rating;

  Object.assign(restaurant, updateData);
  await restaurant.save();

  return restaurant;
};

/**
 * Toggle restaurant open/close status
 */
const toggleOpenStatus = async (restaurantId, ownerId) => {
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: ownerId });
  
  if (!restaurant) {
    throw new ApiError('Restaurant not found or unauthorized', 404);
  }

  if (!restaurant.isApproved) {
    throw new ApiError('Restaurant must be approved before opening', 400);
  }

  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();

  return restaurant;
};

/**
 * Get all open and approved restaurants (for customers)
 */
const getOpenRestaurants = async () => {
  const restaurants = await Restaurant.find({
    isOpen: true,
    isApproved: true
  }).select('name description cuisine address avgPrepTime rating isOpen');

  // If no open restaurants, return top-rated approved restaurants
  if (restaurants.length === 0) {
    console.log('No open restaurants found, returning top approved restaurants');
    const approvedRestaurants = await Restaurant.find({ isApproved: true })
      .select('name description cuisine address avgPrepTime rating isOpen')
      .sort({ rating: -1 })
      .limit(10);
    return approvedRestaurants;
  }

  return restaurants;
};

/**
 * Get all restaurants (including closed)
 */
const getAllRestaurants = async () => {
  const restaurants = await Restaurant.find({ isApproved: true })
    .select('name description cuisine address avgPrepTime rating isOpen');

  return restaurants;
};

// ============ Menu Item Operations ============

/**
 * Add menu item
 */
const addMenuItem = async (itemData, restaurantId, ownerId) => {
  // Verify ownership
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: ownerId });
  if (!restaurant) {
    throw new ApiError('Restaurant not found or unauthorized', 404);
  }

  const menuItem = await MenuItem.create({
    ...itemData,
    restaurant: restaurantId
  });

  return menuItem;
};

/**
 * Update menu item
 */
const updateMenuItem = async (itemId, updateData, ownerId) => {
  const menuItem = await MenuItem.findById(itemId).populate('restaurant');
  
  if (!menuItem) {
    throw new ApiError('Menu item not found', 404);
  }

  // Verify ownership
  if (menuItem.restaurant.owner.toString() !== ownerId.toString()) {
    throw new ApiError('Unauthorized to update this item', 403);
  }

  // Prevent changing restaurant
  delete updateData.restaurant;

  Object.assign(menuItem, updateData);
  await menuItem.save();

  return menuItem;
};

/**
 * Delete menu item
 */
const deleteMenuItem = async (itemId, ownerId) => {
  const menuItem = await MenuItem.findById(itemId).populate('restaurant');
  
  if (!menuItem) {
    throw new ApiError('Menu item not found', 404);
  }

  // Verify ownership
  if (menuItem.restaurant.owner.toString() !== ownerId.toString()) {
    throw new ApiError('Unauthorized to delete this item', 403);
  }

  await menuItem.deleteOne();

  return { message: 'Menu item deleted successfully' };
};

/**
 * Get menu items for a restaurant
 */
const getMenuItems = async (restaurantId, includeUnavailable = false) => {
  const query = { restaurant: restaurantId };
  
  if (!includeUnavailable) {
    query.isAvailable = true;
  }

  const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
  return menuItems;
};

/**
 * Toggle menu item availability
 */
const toggleItemAvailability = async (itemId, ownerId) => {
  const menuItem = await MenuItem.findById(itemId).populate('restaurant');
  
  if (!menuItem) {
    throw new ApiError('Menu item not found', 404);
  }

  // Verify ownership
  if (menuItem.restaurant.owner.toString() !== ownerId.toString()) {
    throw new ApiError('Unauthorized', 403);
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  return menuItem;
};

// ============ Order Operations for Restaurant ============

/**
 * Get orders for restaurant
 */
const getRestaurantOrders = async (restaurantId, status = null) => {
  const query = { restaurant: restaurantId };
  
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('customer', 'name phone address')
    .populate('deliveryPartner', 'name phone')
    .sort({ createdAt: -1 });

  return orders;
};

/**
 * Accept order
 */
const acceptOrder = async (orderId, restaurantId) => {
  const order = await Order.findOne({
    _id: orderId,
    restaurant: restaurantId,
    status: ORDER_STATUS.PENDING
  });

  if (!order) {
    throw new ApiError('Order not found or cannot be accepted', 404);
  }

  order.status = ORDER_STATUS.ACCEPTED;
  order.acceptedAt = new Date();
  await order.save();

  return order;
};

/**
 * Reject order
 */
const rejectOrder = async (orderId, restaurantId, reason = '') => {
  const order = await Order.findOne({
    _id: orderId,
    restaurant: restaurantId,
    status: ORDER_STATUS.PENDING
  });

  if (!order) {
    throw new ApiError('Order not found or cannot be rejected', 404);
  }

  order.status = ORDER_STATUS.REJECTED;
  order.rejectedAt = new Date();
  order.rejectionReason = reason;
  await order.save();

  return order;
};

/**
 * Update order status (preparing/ready)
 */
const updateOrderStatus = async (orderId, restaurantId, newStatus) => {
  const allowedStatuses = [ORDER_STATUS.PREPARING, ORDER_STATUS.READY];
  
  if (!allowedStatuses.includes(newStatus)) {
    throw new ApiError('Invalid status for restaurant', 400);
  }

  const order = await Order.findOne({
    _id: orderId,
    restaurant: restaurantId
  });

  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  // Validate status transition
  if (newStatus === ORDER_STATUS.PREPARING && order.status !== ORDER_STATUS.ACCEPTED) {
    throw new ApiError('Order must be accepted before preparing', 400);
  }

  if (newStatus === ORDER_STATUS.READY && order.status !== ORDER_STATUS.PREPARING) {
    throw new ApiError('Order must be preparing before ready', 400);
  }

  order.status = newStatus;
  
  if (newStatus === ORDER_STATUS.PREPARING) {
    order.preparingAt = new Date();
  } else if (newStatus === ORDER_STATUS.READY) {
    order.readyAt = new Date();
  }

  await order.save();
  return order;
};

/**
 * Get restaurant statistics
 */
const getRestaurantStats = async (restaurantId) => {
  const orders = await Order.find({
    restaurant: restaurantId,
    status: ORDER_STATUS.DELIVERED
  });

  const stats = {
    totalOrders: orders.length,
    totalEarnings: 0,
    totalCommissionPaid: 0
  };

  orders.forEach(order => {
    stats.totalEarnings += order.restaurantEarning;
    stats.totalCommissionPaid += order.adminCommission;
  });

  // Get pending orders count
  stats.pendingOrders = await Order.countDocuments({
    restaurant: restaurantId,
    status: ORDER_STATUS.PENDING
  });

  return stats;
};

module.exports = {
  createRestaurant,
  getRestaurantByOwner,
  getRestaurantById,
  updateRestaurant,
  toggleOpenStatus,
  getOpenRestaurants,
  getAllRestaurants,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItems,
  toggleItemAvailability,
  getRestaurantOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  getRestaurantStats
};
