/**
 * RUZIO - Notification Model
 * Stores notifications for restaurants and delivery partners
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Notification type
  type: {
    type: String,
    enum: ['new_order', 'order_update', 'order_assigned', 'order_ready', 'order_cancelled', 'general'],
    required: true
  },
  // Title of notification
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Message content
  message: {
    type: String,
    required: true,
    trim: true
  },
  // Related order (if applicable)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  // Whether notification has been read
  isRead: {
    type: Boolean,
    default: false
  },
  // Whether notification has been seen (clicked bell icon)
  isSeen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isSeen: 1 });

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, isRead: false });
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, orderId = null) {
  return await this.create({
    user: userId,
    type,
    title,
    message,
    order: orderId
  });
};

module.exports = mongoose.model('Notification', notificationSchema);