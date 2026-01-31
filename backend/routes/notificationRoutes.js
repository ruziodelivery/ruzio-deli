/**
 * RUZIO - Notification Routes
 * Notification endpoints for restaurant and delivery partners
 */

const express = require('express');
const router = express.Router();
const { notificationController } = require('../controllers');
const { protect, mongoIdValidation } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// Mark all as seen (bell icon clicked)
router.put('/seen', notificationController.markAllAsSeen);

// Mark single notification as read
router.put('/:id/read', mongoIdValidation, notificationController.markAsRead);

// Delete single notification
router.delete('/:id', mongoIdValidation, notificationController.deleteNotification);

// Clear all notifications
router.delete('/', notificationController.clearAllNotifications);

module.exports = router;