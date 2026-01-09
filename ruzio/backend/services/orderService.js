/**
 * RUZIO - Order Service
 * Business logic for order operations
 */

const { Order, MenuItem, Restaurant, PlatformSettings, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { ORDER_STATUS, ROLES } = require('../config/constants');

/**
 * Calculate delivery charge based on distance
 * Formula: baseDeliveryCharge + (distance_km * perKmRate)
 */
const calculateDeliveryCharge = async (distanceKm) => {
  const settings = await PlatformSettings.getSettings();
  return settings.baseDeliveryCharge + (distanceKm * settings.perKmRate);
};

/**
 * Calculate commission
 * Formula: order_total * commissionPercentage / 100
 */
const calculateCommission = async (orderTotal) => {
  const settings = await PlatformSettings.getSettings();
  return (orderTotal * settings.commissionPercentage) / 100;
};

/**
 * Place a new order
 */
const placeOrder = async (orderData, customerId) => {
  const { restaurantId, items, deliveryAddress, distanceKm, customerNote } = orderData;

  // Verify restaurant exists and is open
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isOpen: true,
    isApproved: true
  });

  if (!restaurant) {
    throw new ApiError('Restaurant not found or currently closed', 404);
  }

  // Fetch menu items and calculate totals
  const orderItems = [];
  let itemsTotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findOne({
      _id: item.menuItemId,
      restaurant: restaurantId,
      isAvailable: true
    });

    if (!menuItem) {
      throw new ApiError(`Menu item ${item.menuItemId} not available`, 400);
    }

    const subtotal = menuItem.price * item.quantity;
    
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.price,
      subtotal
    });

    itemsTotal += subtotal;
  }

  // Get platform settings for calculations
  const settings = await PlatformSettings.getSettings();

  // Calculate charges
  const deliveryCharge = settings.baseDeliveryCharge + (distanceKm * settings.perKmRate);
  const totalAmount = itemsTotal + deliveryCharge;
  
  // Calculate commission
  const adminCommission = (itemsTotal * settings.commissionPercentage) / 100;
  const restaurantEarning = itemsTotal - adminCommission;

  // Create order
  const order = await Order.create({
    customer: customerId,
    restaurant: restaurantId,
    items: orderItems,
    deliveryAddress,
    distanceKm,
    itemsTotal,
    deliveryCharge,
    totalAmount,
    commissionPercentage: settings.commissionPercentage,
    adminCommission,
    restaurantEarning,
    customerNote,
    status: ORDER_STATUS.PENDING
  });

  // Increment restaurant total orders
  restaurant.totalOrders += 1;
  await restaurant.save();

  return order;
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate('customer', 'name email phone address')
    .populate('restaurant', 'name address phone')
    .populate('deliveryPartner', 'name phone');

  if (!order) {
    throw new ApiError('Order not found', 404);
  }

  // Authorization check
  if (userRole === ROLES.CUSTOMER && order.customer._id.toString() !== userId.toString()) {
    throw new ApiError('Unauthorized', 403);
  }

  if (userRole === ROLES.DELIVERY && 
      order.deliveryPartner && 
      order.deliveryPartner._id.toString() !== userId.toString()) {
    throw new ApiError('Unauthorized', 403);
  }

  return order;
};

/**
 * Get customer orders
 */
const getCustomerOrders = async (customerId) => {
  const orders = await Order.find({ customer: customerId })
    .populate('restaurant', 'name')
    .sort({ createdAt: -1 });

  return orders;
};

/**
 * Cancel order (customer can cancel if pending)
 */
const cancelOrder = async (orderId, customerId) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
    status: ORDER_STATUS.PENDING
  });

  if (!order) {
    throw new ApiError('Order not found or cannot be cancelled', 404);
  }

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  await order.save();

  return order;
};

/**
 * Get order estimate (preview before placing)
 */
const getOrderEstimate = async (restaurantId, items, distanceKm) => {
  // Calculate items total
  let itemsTotal = 0;
  const itemDetails = [];

  for (const item of items) {
    const menuItem = await MenuItem.findOne({
      _id: item.menuItemId,
      restaurant: restaurantId,
      isAvailable: true
    });

    if (!menuItem) {
      throw new ApiError(`Menu item ${item.menuItemId} not available`, 400);
    }

    const subtotal = menuItem.price * item.quantity;
    itemDetails.push({
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      subtotal
    });
    itemsTotal += subtotal;
  }

  // Get settings
  const settings = await PlatformSettings.getSettings();

  // Calculate charges
  const deliveryCharge = settings.baseDeliveryCharge + (distanceKm * settings.perKmRate);
  const totalAmount = itemsTotal + deliveryCharge;

  return {
    items: itemDetails,
    itemsTotal,
    deliveryCharge,
    distanceKm,
    totalAmount,
    breakdown: {
      baseDeliveryCharge: settings.baseDeliveryCharge,
      perKmRate: settings.perKmRate,
      distanceCharge: distanceKm * settings.perKmRate
    }
  };
};

module.exports = {
  calculateDeliveryCharge,
  calculateCommission,
  placeOrder,
  getOrderById,
  getCustomerOrders,
  cancelOrder,
  getOrderEstimate
};
