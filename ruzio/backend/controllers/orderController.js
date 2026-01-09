/**
 * RUZIO - Order Controller
 * Handles customer order endpoints
 */

const { orderService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Place new order
 * @route   POST /api/orders
 * @access  Customer
 */
const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private (owner/restaurant/delivery/admin)
 */
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Get customer's orders
 * @route   GET /api/orders/my-orders
 * @access  Customer
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getCustomerOrders(req.user._id);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Customer (owner)
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

/**
 * @desc    Get order estimate (preview)
 * @route   POST /api/orders/estimate
 * @access  Customer
 */
const getOrderEstimate = asyncHandler(async (req, res) => {
  const { restaurantId, items, distanceKm } = req.body;
  const estimate = await orderService.getOrderEstimate(restaurantId, items, distanceKm);

  res.status(200).json({
    success: true,
    data: estimate
  });
});

module.exports = {
  placeOrder,
  getOrder,
  getMyOrders,
  cancelOrder,
  getOrderEstimate
};
