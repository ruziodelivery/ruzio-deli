/**
 * RUZIO - Shared UI Components
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

// Currency formatting helper
export const formatCurrency = (amount) => {
  return `₹${Number(amount).toFixed(2)}`;
};

// Notification Bell Component
export function NotificationBell() {
  const { unreadCount, notifications, markAllAsRead, markAsRead, fetchNotifications } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBellClick = async () => {
    if (!showDropdown) {
      await fetchNotifications();
    }
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-1 hover:bg-primary-700 rounded transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllAsRead(); }}
                className="text-xs text-primary-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification._id}
                onClick={() => markAsRead(notification._id)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg">
                    {notification.type === 'new_order' ? '🛒' : 
                     notification.type === 'order_assigned' ? '🚴' : 
                     notification.type === 'order_ready' ? '✅' : '📢'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                    <p className="text-xs text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Navigation Bar
export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'restaurant': return '/restaurant';
      case 'delivery': return '/delivery';
      case 'customer': return '/customer';
      default: return '/';
    }
  };

  const showNotificationBell = isAuthenticated && (user?.role === 'restaurant' || user?.role === 'delivery');

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={getDashboardLink()} className="text-2xl font-bold">
          🍕 RUZIO
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Download App Button */}
          <a
            href="#download"
            className="hidden md:block bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm font-medium transition"
          >
            📱 Download App
          </a>

          {isAuthenticated ? (
            <>
              {showNotificationBell && <NotificationBell />}
              
              {user.role === 'customer' && (
                <Link to="/cart" className="relative">
                  🛒
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
              <span className="text-sm bg-primary-700 px-2 py-1 rounded">
                {user.role.toUpperCase()}
              </span>
              <span className="text-sm hidden md:inline">{user.name}</span>
              <button
                onClick={logout}
                className="bg-primary-800 px-3 py-1 rounded hover:bg-primary-900 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="bg-primary-800 px-3 py-1 rounded hover:bg-primary-900 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Bottom Navigation for Mobile (Customer)
export function BottomNav() {
  const { user, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  if (!isAuthenticated || user?.role !== 'customer') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-40">
      <div className="flex justify-around items-center py-2">
        <Link to="/browse" className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-600">
          <span className="text-xl">🏠</span>
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/browse" className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-600">
          <span className="text-xl">🔍</span>
          <span className="text-xs">Search</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-600 relative">
          <span className="text-xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute top-0 right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-xs">Cart</span>
        </Link>
        <Link to="/orders" className="flex flex-col items-center p-2 text-gray-600 hover:text-primary-600">
          <span className="text-xl">👤</span>
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

// Page Layout
export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

// Loading Spinner
export function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

// Error Display
export function ErrorMessage({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {message}
    </div>
  );
}

// Success Display
export function SuccessMessage({ message }) {
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      {message}
    </div>
  );
}

// Card Component
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

// Button Component
export function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded font-medium transition ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// Input Component
export function Input({ label, type = 'text', name, value, onChange, placeholder, required = false, error }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Select Component
export function Select({ label, name, value, onChange, options, required = false }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// Badge Component
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Order Status Badge
export function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Pending' },
    accepted: { variant: 'primary', label: 'Accepted' },
    rejected: { variant: 'danger', label: 'Rejected' },
    preparing: { variant: 'primary', label: 'Preparing' },
    ready: { variant: 'success', label: 'Ready' },
    assigned: { variant: 'primary', label: 'Assigned' },
    picked_up: { variant: 'primary', label: 'Picked Up' },
    delivered: { variant: 'success', label: 'Delivered' },
    cancelled: { variant: 'danger', label: 'Cancelled' }
  };

  const config = statusConfig[status] || { variant: 'default', label: status };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Vertical Order Status Tracker
export function OrderStatusTracker({ order }) {
  const statuses = [
    { key: 'pending', label: 'Order Placed', icon: '📝', time: order.createdAt },
    { key: 'accepted', label: 'Accepted by Restaurant', icon: '✅', time: order.acceptedAt },
    { key: 'preparing', label: 'Preparing Your Food', icon: '👨‍🍳', time: order.preparingAt },
    { key: 'ready', label: 'Ready for Pickup', icon: '📦', time: order.readyAt },
    { key: 'assigned', label: 'Delivery Partner Assigned', icon: '🚴', time: order.assignedAt },
    { key: 'picked_up', label: 'Out for Delivery', icon: '🛵', time: order.pickedUpAt },
    { key: 'delivered', label: 'Delivered', icon: '🎉', time: order.deliveredAt }
  ];

  const statusOrder = ['pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="space-y-0">
      {statuses.map((status, index) => {
        const isCompleted = statusOrder.indexOf(status.key) <= currentIndex;
        const isActive = status.key === order.status;
        const isLast = index === statuses.length - 1;

        return (
          <div key={status.key} className="flex items-start">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center mr-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isActive ? 'bg-primary-600 text-white ring-4 ring-primary-200' :
                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted && !isActive ? '✓' : status.icon}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-12 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`}
                />
              )}
            </div>

            {/* Status content */}
            <div className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}>
              <p className={`font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {status.label}
              </p>
              {status.time && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(status.time).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Star Rating Component
export function StarRating({ rating, onRate, readonly = false, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center space-x-1">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRate && onRate(star)}
          disabled={readonly}
          className={`${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          {star <= rating ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}

// Stat Card
export function StatCard({ title, value, icon }) {
  return (
    <Card className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-primary-600">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </Card>
  );
}

// Empty State
export function EmptyState({ message, icon = '📭' }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// Modal Component
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Toggle Switch Component
export function ToggleSwitch({ enabled, onChange, label }) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-10 h-6 rounded-full transition ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition transform ${enabled ? 'translate-x-4' : ''}`}></div>
      </div>
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
}