/**
 * RUZIO - Notification Service
 * Business logic for notification operations
 */

const { Notification } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get notifications for a user
 */
const getNotifications = async (userId, limit = 20) => {
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return notifications;
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ user: userId, isRead: false });
  return count;
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  return notification;
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  return { message: 'All notifications marked as read' };
};

/**
 * Mark notifications as seen (bell icon clicked)
 */
const markAllAsSeen = async (userId) => {
  await Notification.updateMany(
    { user: userId, isSeen: false },
    { isSeen: true }
  );

  return { message: 'All notifications marked as seen' };
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    throw new ApiError('Notification not found', 404);
  }

  return { message: 'Notification deleted' };
};

/**
 * Clear all notifications for a user
 */
const clearAllNotifications = async (userId) => {
  await Notification.deleteMany({ user: userId });
  return { message: 'All notifications cleared' };
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markAllAsSeen,
  deleteNotification,
  clearAllNotifications
};