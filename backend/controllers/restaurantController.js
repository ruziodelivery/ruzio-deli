/**
 * RUZIO - Restaurant Controller
 * Handles restaurant endpoints
 */

const { restaurantService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

// ============ Restaurant Profile ============

/**
 * @desc    Create restaurant profile
 * @route   POST /api/restaurant
 * @access  Restaurant
 */
const createRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.createRestaurant(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Restaurant created successfully',
    data: restaurant
  });
});

/**
 * @desc    Get own restaurant profile
 * @route   GET /api/restaurant/my-restaurant
 * @access  Restaurant
 */
const getMyRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantByOwner(req.user._id);

  res.status(200).json({
    success: true,
    data: restaurant
  });
});

/**
 * @desc    Update restaurant profile
 * @route   PUT /api/restaurant/:id
 * @access  Restaurant (owner)
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurant(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Restaurant updated successfully',
    data: restaurant
  });
});

/**
 * @desc    Toggle restaurant open/close
 * @route   PUT /api/restaurant/:id/toggle-status
 * @access  Restaurant (owner)
 */
const toggleOpenStatus = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.toggleOpenStatus(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: `Restaurant is now ${restaurant.isOpen ? 'OPEN' : 'CLOSED'}`,
    data: restaurant
  });
});

/**
 * @desc    Get open restaurants (for customers)
 * @route   GET /api/restaurant/open
 * @access  Public
 */
const getOpenRestaurants = asyncHandler(async (req, res) => {
  console.log('Getting open restaurants...');
  const restaurants = await restaurantService.getOpenRestaurants();
  console.log(`Found ${restaurants.length} restaurants`);

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

/**
 * @desc    Get all restaurants
 * @route   GET /api/restaurant
 * @access  Public
 */
const getAllRestaurants = asyncHandler(async (req, res) => {
  console.log('Getting all restaurants...');
  const restaurants = await restaurantService.getAllRestaurants();
  console.log(`Found ${restaurants.length} restaurants total`);

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

/**
 * @desc    Get restaurant by ID
 * @route   GET /api/restaurant/:id
 * @access  Public
 */
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantById(req.params.id);

  res.status(200).json({
    success: true,
    data: restaurant
  });
});

// ============ Menu Items ============

/**
 * @desc    Add menu item
 * @route   POST /api/restaurant/:restaurantId/menu
 * @access  Restaurant (owner)
 */
const addMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await restaurantService.addMenuItem(
    req.body,
    req.params.restaurantId,
    req.user._id
  );

  res.status(201).json({
    success: true,
    message: 'Menu item added successfully',
    data: menuItem
  });
});

/**
 * @desc    Update menu item
 * @route   PUT /api/restaurant/menu/:itemId
 * @access  Restaurant (owner)
 */
const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await restaurantService.updateMenuItem(
    req.params.itemId,
    req.body,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem
  });
});

/**
 * @desc    Delete menu item
 * @route   DELETE /api/restaurant/menu/:itemId
 * @access  Restaurant (owner)
 */
const deleteMenuItem = asyncHandler(async (req, res) => {
  await restaurantService.deleteMenuItem(req.params.itemId, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

/**
 * @desc    Get menu items for restaurant
 * @route   GET /api/restaurant/:restaurantId/menu
 * @access  Public
 */
const getMenuItems = asyncHandler(async (req, res) => {
  // If owner is viewing, include unavailable items
  const includeUnavailable = req.user && req.user.role === 'restaurant';
  const menuItems = await restaurantService.getMenuItems(
    req.params.restaurantId,
    includeUnavailable
  );

  res.status(200).json({
    success: true,
    count: menuItems.length,
    data: menuItems
  });
});

/**
 * @desc    Toggle menu item availability
 * @route   PUT /api/restaurant/menu/:itemId/toggle
 * @access  Restaurant (owner)
 */
const toggleItemAvailability = asyncHandler(async (req, res) => {
  const menuItem = await restaurantService.toggleItemAvailability(
    req.params.itemId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: `Item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
    data: menuItem
  });
});

// ============ Restaurant Orders ============

/**
 * @desc    Get restaurant orders
 * @route   GET /api/restaurant/:restaurantId/orders
 * @access  Restaurant (owner)
 */
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantByOwner(req.user._id);
  const orders = await restaurantService.getRestaurantOrders(
    restaurant._id,
    req.query.status
  );

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Accept order
 * @route   PUT /api/restaurant/orders/:orderId/accept
 * @access  Restaurant (owner)
 */
const acceptOrder = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantByOwner(req.user._id);
  const order = await restaurantService.acceptOrder(req.params.orderId, restaurant._id);

  res.status(200).json({
    success: true,
    message: 'Order accepted',
    data: order
  });
});

/**
 * @desc    Reject order
 * @route   PUT /api/restaurant/orders/:orderId/reject
 * @access  Restaurant (owner)
 */
const rejectOrder = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantByOwner(req.user._id);
  const order = await restaurantService.rejectOrder(
    req.params.orderId,
    restaurant._id,
    req.body.reason
  );

  res.status(200).json({
    success: true,
    message: 'Order rejected',
    data: order
  });
});

/**
 * @desc    Update order status (preparing/ready)
 * @route   PUT /api/restaurant/orders/:orderId/status
 * @access  Restaurant (owner)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantByOwner(req.user._id);
  const order = await restaurantService.updateOrderStatus(
    req.params.orderId,
    restaurant._id,
    req.body.status
  );

  res.status(200).json({
    success: true,
    message: `Order status updated to ${order.status}`,
    data: order
  });
});

/**
 * @desc    Get restaurant statistics
 * @route   GET /api/restaurant/stats
 * @access  Restaurant (owner)
 */
const getRestaurantStats = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantByOwner(req.user._id);
  const stats = await restaurantService.getRestaurantStats(restaurant._id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant,
  toggleOpenStatus,
  getOpenRestaurants,
  getAllRestaurants,
  getRestaurantById,
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
