/**
 * RUZIO - Delivery Controller
 * Handles delivery partner endpoints
 */

const { deliveryService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get available orders for delivery
 * @route   GET /api/delivery/available
 * @access  Delivery
 */
const getAvailableOrders = asyncHandler(async (req, res) => {
  const orders = await deliveryService.getAvailableOrders();

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Accept delivery order
 * @route   PUT /api/delivery/accept/:orderId
 * @access  Delivery
 */
const acceptDelivery = asyncHandler(async (req, res) => {
  const order = await deliveryService.acceptDelivery(req.params.orderId, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Order accepted for delivery',
    data: order
  });
});

/**
 * @desc    Get current active delivery
 * @route   GET /api/delivery/active
 * @access  Delivery
 */
const getActiveDelivery = asyncHandler(async (req, res) => {
  const order = await deliveryService.getActiveDelivery(req.user._id);

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Update delivery status (picked_up/delivered)
 * @route   PUT /api/delivery/status/:orderId
 * @access  Delivery
 */
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const order = await deliveryService.updateDeliveryStatus(
    req.params.orderId,
    req.user._id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: `Delivery status updated to ${order.status}`,
    data: order
  });
});

/**
 * @desc    Get delivery history
 * @route   GET /api/delivery/history
 * @access  Delivery
 */
const getDeliveryHistory = asyncHandler(async (req, res) => {
  const orders = await deliveryService.getDeliveryHistory(req.user._id);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Get delivery statistics
 * @route   GET /api/delivery/stats
 * @access  Delivery
 */
const getDeliveryStats = asyncHandler(async (req, res) => {
  const stats = await deliveryService.getDeliveryStats(req.user._id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getAvailableOrders,
  acceptDelivery,
  getActiveDelivery,
  updateDeliveryStatus,
  getDeliveryHistory,
  getDeliveryStats
};
