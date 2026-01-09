/**
 * RUZIO - Main App Component
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin
import AdminDashboard from './pages/admin/Dashboard';

// Restaurant
import RestaurantDashboard from './pages/restaurant/Dashboard';

// Delivery
import DeliveryDashboard from './pages/delivery/Dashboard';

// Customer
import CustomerHome from './pages/customer/Home';
import BrowseRestaurants from './pages/customer/BrowseRestaurants';
import RestaurantMenu from './pages/customer/RestaurantMenu';
import Cart from './pages/customer/Cart';
import MyOrders from './pages/customer/MyOrders';
import OrderDetails from './pages/customer/OrderDetails';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" /> : <Register />} 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Restaurant Routes */}
        <Route 
          path="/restaurant" 
          element={
            <ProtectedRoute allowedRoles={['restaurant']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Delivery Routes */}
        <Route 
          path="/delivery" 
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <DeliveryDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Customer Routes */}
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerHome />
            </ProtectedRoute>
          } 
        />
        <Route path="/browse" element={<BrowseRestaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantMenu />} />
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MyOrders />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute allowedRoles={['customer', 'restaurant', 'delivery', 'admin']}>
              <OrderDetails />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
