/**
 * RUZIO - Delivery Service
 * Business logic for delivery partner operations
 */

const { Order, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { ORDER_STATUS, ROLES } = require('../config/constants');

/**
 * Get available orders for delivery (ready for pickup)
 */
const getAvailableOrders = async () => {
  const orders = await Order.find({
    status: ORDER_STATUS.READY,
    deliveryPartner: null
  })
    .populate('restaurant', 'name address')
    .populate('customer', 'name address')
    .sort({ readyAt: 1 }); // Oldest ready first

  return orders;
};

/**
 * Accept/assign order to delivery partner
 */
const acceptDelivery = async (orderId, deliveryPartnerId) => {
  // Check if delivery partner is approved
  const deliveryPartner = await User.findOne({
    _id: deliveryPartnerId,
    role: ROLES.DELIVERY,
    isApproved: true,
    isActive: true
  });

  if (!deliveryPartner) {
    throw new ApiError('Delivery partner not approved', 403);
  }

  // Check if partner already has an active delivery
  const activeDelivery = await Order.findOne({
    deliveryPartner: deliveryPartnerId,
    status: { $in: [ORDER_STATUS.ASSIGNED, ORDER_STATUS.PICKED_UP] }
  });

  if (activeDelivery) {
    throw new ApiError('You already have an active delivery. Complete it first.', 400);
  }

  // Find and assign order
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: ORDER_STATUS.READY,
      deliveryPartner: null
    },
    {
      deliveryPartner: deliveryPartnerId,
      status: ORDER_STATUS.ASSIGNED,
      assignedAt: new Date()
    },
    { new: true }
  )
    .populate('restaurant', 'name address phone')
    .populate('customer', 'name address phone');

  if (!order) {
    throw new ApiError('Order not available or already assigned', 404);
  }

  return order;
};

/**
 * Get current active delivery for partner
 */
const getActiveDelivery = async (deliveryPartnerId) => {
  const order = await Order.findOne({
    deliveryPartner: deliveryPartnerId,
    status: { $in: [ORDER_STATUS.ASSIGNED, ORDER_STATUS.PICKED_UP] }
  })
    .populate('restaurant', 'name address phone')
    .populate('customer', 'name address phone');

  return order;
};

/**
 * Update order status (picked_up, delivered)
 */
const updateDeliveryStatus = async (orderId, deliveryPartnerId, newStatus) => {
  const allowedStatuses = [ORDER_STATUS.PICKED_UP, ORDER_STATUS.DELIVERED];
  
  if (!allowedStatuses.includes(newStatus)) {
    throw new ApiError('Invalid status for delivery partner', 400);
  }

  const order = await Order.findOne({
    _id: orderId,
    deliveryPartner: deliveryPartnerId
  });

  if (!order) {
    throw new ApiError('Order not found or not assigned to you', 404);
  }

  // Validate status transitions
  if (newStatus === ORDER_STATUS.PICKED_UP && order.status !== ORDER_STATUS.ASSIGNED) {
    throw new ApiError('Order must be assigned before pickup', 400);
  }

  if (newStatus === ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.PICKED_UP) {
    throw new ApiError('Order must be picked up before delivery', 400);
  }

  order.status = newStatus;
  
  if (newStatus === ORDER_STATUS.PICKED_UP) {
    order.pickedUpAt = new Date();
  } else if (newStatus === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
  }

  await order.save();

  return order;
};

/**
 * Get delivery history for partner
 */
const getDeliveryHistory = async (deliveryPartnerId) => {
  const orders = await Order.find({
    deliveryPartner: deliveryPartnerId,
    status: ORDER_STATUS.DELIVERED
  })
    .populate('restaurant', 'name')
    .populate('customer', 'name')
    .sort({ deliveredAt: -1 });

  return orders;
};

/**
 * Get delivery partner statistics
 */
const getDeliveryStats = async (deliveryPartnerId) => {
  const completedDeliveries = await Order.find({
    deliveryPartner: deliveryPartnerId,
    status: ORDER_STATUS.DELIVERED
  });

  const stats = {
    totalDeliveries: completedDeliveries.length,
    totalDeliveryEarnings: 0 // In real app, this would track delivery partner earnings
  };

  // Calculate total delivery charges collected
  completedDeliveries.forEach(order => {
    stats.totalDeliveryEarnings += order.deliveryCharge;
  });

  // Get pending pickups count
  stats.pendingPickups = await Order.countDocuments({
    deliveryPartner: deliveryPartnerId,
    status: ORDER_STATUS.ASSIGNED
  });

  return stats;
};

module.exports = {
  getAvailableOrders,
  acceptDelivery,
  getActiveDelivery,
  updateDeliveryStatus,
  getDeliveryHistory,
  getDeliveryStats
};
