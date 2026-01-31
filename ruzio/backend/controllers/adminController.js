/**
 * RUZIO - Admin Controller
 * Handles admin endpoints
 */

const { adminService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get platform settings
 * @route   GET /api/admin/settings
 * @access  Admin
 */
const getSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.getSettings();

  res.status(200).json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Update platform settings
 * @route   PUT /api/admin/settings
 * @access  Admin
 */
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await adminService.updateSettings(req.body, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: settings
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

/**
 * @desc    Approve user
 * @route   PUT /api/admin/users/:id/approve
 * @access  Admin
 */
const approveUser = asyncHandler(async (req, res) => {
  const user = await adminService.approveUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User approved successfully',
    data: user
  });
});

/**
 * @desc    Block user
 * @route   PUT /api/admin/users/:id/block
 * @access  Admin
 */
const blockUser = asyncHandler(async (req, res) => {
  const user = await adminService.toggleUserStatus(req.params.id, false);

  res.status(200).json({
    success: true,
    message: 'User blocked successfully',
    data: user
  });
});

/**
 * @desc    Unblock user
 * @route   PUT /api/admin/users/:id/unblock
 * @access  Admin
 */
const unblockUser = asyncHandler(async (req, res) => {
  const user = await adminService.toggleUserStatus(req.params.id, true);

  res.status(200).json({
    success: true,
    message: 'User unblocked successfully',
    data: user
  });
});

/**
 * @desc    Get all orders
 * @route   GET /api/admin/orders
 * @access  Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await adminService.getAllOrders(req.query);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Get platform earnings/statistics
 * @route   GET /api/admin/earnings
 * @access  Admin
 */
const getEarnings = asyncHandler(async (req, res) => {
  const stats = await adminService.getPlatformEarnings();

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Get all restaurants
 * @route   GET /api/admin/restaurants
 * @access  Admin
 */
const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await adminService.getAllRestaurants();

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

/**
 * @desc    Approve restaurant
 * @route   PUT /api/admin/restaurants/:id/approve
 * @access  Admin
 */
const approveRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await adminService.approveRestaurant(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Restaurant approved successfully',
    data: restaurant
  });
});

module.exports = {
  getSettings,
  updateSettings,
  getAllUsers,
  approveUser,
  blockUser,
  unblockUser,
  getAllOrders,
  getEarnings,
  getAllRestaurants,
  approveRestaurant
};
