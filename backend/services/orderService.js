
/**
 * RUZIO - Order Service
 * Business logic for order operations
 */

const { Order, MenuItem, Restaurant, PlatformSettings, User, Notification } = require('../models');
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
 * Get commission percentage for a restaurant
 * Returns restaurant-specific or platform default
 */
const getCommissionPercentage = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  const settings = await PlatformSettings.getSettings();
  
  // Use restaurant-specific commission if set, otherwise platform default
  return restaurant?.commissionPercentage ?? settings.commissionPercentage;
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
      isAvailable: true,
      isActive: true
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
      subtotal,
      image: menuItem.image
    });

    itemsTotal += subtotal;
  }

  // Get platform settings for calculations
  const settings = await PlatformSettings.getSettings();

  // Calculate charges
  const deliveryCharge = settings.baseDeliveryCharge + (distanceKm * settings.perKmRate);
  
  // Calculate platform fee (2.4% of items total)
  const platformFee = Math.round((itemsTotal * settings.platformFeePercentage) / 100 * 100) / 100;
  
  const totalAmount = itemsTotal + deliveryCharge + platformFee;
  
  // Get commission percentage (restaurant-specific or platform default)
  const commissionPercentage = restaurant.commissionPercentage ?? settings.commissionPercentage;
  
  // Calculate commission on items total
  const adminCommission = Math.round((itemsTotal * commissionPercentage) / 100 * 100) / 100;
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
    platformFee,
    totalAmount,
    commissionPercentage,
    adminCommission,
    restaurantEarning,
    customerNote,
    status: ORDER_STATUS.PENDING
  });

  // Increment restaurant total orders
  restaurant.totalOrders += 1;
  await restaurant.save();

  // Create notification for restaurant owner
  const restaurantOwner = await User.findById(restaurant.owner);
  if (restaurantOwner) {
    await Notification.createNotification(
      restaurantOwner._id,
      'new_order',
      'New Order Received!',
      `Order #${order.orderNumber} - ₹${totalAmount.toFixed(2)}`,
      order._id
    );
  }

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
    .populate('deliveryPartner', 'name phone')
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
 * Rate and review an order
 */
const rateOrder = async (orderId, customerId, rating, review) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
    status: ORDER_STATUS.DELIVERED
  });

  if (!order) {
    throw new ApiError('Order not found or not delivered yet', 404);
  }

  if (order.rating) {
    throw new ApiError('Order has already been rated', 400);
  }

  order.rating = rating;
  order.review = review;
  order.reviewedAt = new Date();
  await order.save();

  // Update restaurant rating
  const restaurant = await Restaurant.findById(order.restaurant);
  if (restaurant) {
    const newRatingCount = restaurant.ratingCount + 1;
    const newRating = ((restaurant.rating * restaurant.ratingCount) + rating) / newRatingCount;
    restaurant.rating = Math.round(newRating * 10) / 10;
    restaurant.ratingCount = newRatingCount;
    await restaurant.save();
  }

  return order;
};

module.exports = {
  calculateDeliveryCharge,
  getCommissionPercentage,
  placeOrder,
  getOrderById,
  getCustomerOrders,
  cancelOrder,
  rateOrder
};
