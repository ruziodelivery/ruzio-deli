/**
 * RUZIO - Notification Context
 * Manages notification state for restaurant and delivery partners
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await notificationAPI.getAll(20);
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated]);

  // Poll for new notifications (for restaurant and delivery partners)
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Only poll for restaurant and delivery roles
    if (user.role === 'restaurant' || user.role === 'delivery') {
      fetchUnreadCount();
      
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, fetchUnreadCount]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Mark all as seen (when bell icon is clicked)
  const markAllAsSeen = async () => {
    try {
      await notificationAPI.markAllAsSeen();
      setNotifications(prev => prev.map(n => ({ ...n, isSeen: true })));
    } catch (error) {
      console.error('Failed to mark notifications as seen:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      const notification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  // Refresh notifications
  const refresh = async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    markAllAsSeen,
    deleteNotification,
    clearAllNotifications,
    refresh
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}