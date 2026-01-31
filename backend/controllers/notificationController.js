/**
 * RUZIO - Notification Controller
 * Handles notification endpoints
 */

const { notificationService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const notifications = await notificationService.getNotifications(req.user._id, limit);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Mark all notifications as seen
 * @route   PUT /api/notifications/seen
 * @access  Private
 */
const markAllAsSeen = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsSeen(req.user._id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/notifications
 * @access  Private
 */
const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.clearAllNotifications(req.user._id);

  res.status(200).json({
    success: true,
    message: result.message
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markAllAsSeen,
  deleteNotification,
  clearAllNotifications
};