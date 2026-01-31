/**
 * RUZIO - Protected Route Component
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      admin: '/admin',
      restaurant: '/restaurant',
      delivery: '/delivery',
      customer: '/browse'
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return children;
}
