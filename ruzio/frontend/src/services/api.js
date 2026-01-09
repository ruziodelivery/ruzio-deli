/**
 * RUZIO - API Service
 * Axios configuration and API calls
 */

import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ruzio_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ruzio_token');
      localStorage.removeItem('ruzio_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Auth API ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// ============ Admin API ============
export const adminAPI = {
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getUsers: (params) => api.get('/admin/users', { params }),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  getRestaurants: () => api.get('/admin/restaurants'),
  approveRestaurant: (id) => api.put(`/admin/restaurants/${id}/approve`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getEarnings: () => api.get('/admin/earnings')
};

// ============ Restaurant API ============
export const restaurantAPI = {
  // Public
  getAll: () => api.get('/restaurant'),
  getOpen: () => api.get('/restaurant/open'),
  getById: (id) => api.get(`/restaurant/${id}`),
  getMenu: (id) => api.get(`/restaurant/${id}/menu`),
  
  // Restaurant owner
  create: (data) => api.post('/restaurant/create', data),  // Updated endpoint
  getMyRestaurant: () => api.get('/restaurant/my-restaurant'),
  update: (id, data) => api.put(`/restaurant/${id}`, data),
  toggleStatus: (id) => api.put(`/restaurant/${id}/toggle-status`),
  
  // Menu management
  addMenuItem: (restaurantId, data) => api.post(`/restaurant/${restaurantId}/menu`, data),
  updateMenuItem: (itemId, data) => api.put(`/restaurant/menu/${itemId}`, data),
  deleteMenuItem: (itemId) => api.delete(`/restaurant/menu/${itemId}`),
  toggleItemAvailability: (itemId) => api.put(`/restaurant/menu/${itemId}/toggle`),
  
  // Order management
  getOrders: (params) => api.get('/restaurant/orders/list', { params }),
  acceptOrder: (orderId) => api.put(`/restaurant/orders/${orderId}/accept`),
  rejectOrder: (orderId, reason) => api.put(`/restaurant/orders/${orderId}/reject`, { reason }),
  updateOrderStatus: (orderId, status) => api.put(`/restaurant/orders/${orderId}/status`, { status }),
  getStats: () => api.get('/restaurant/stats/dashboard')
};

// ============ Order API ============
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getEstimate: (data) => api.post('/orders/estimate', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`)
};

// ============ Delivery API ============
export const deliveryAPI = {
  getAvailable: () => api.get('/delivery/available'),
  accept: (orderId) => api.put(`/delivery/accept/${orderId}`),
  getActive: () => api.get('/delivery/active'),
  updateStatus: (orderId, status) => api.put(`/delivery/status/${orderId}`, { status }),
  getHistory: () => api.get('/delivery/history'),
  getStats: () => api.get('/delivery/stats')
};

export default api;
