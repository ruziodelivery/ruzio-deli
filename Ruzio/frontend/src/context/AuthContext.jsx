/**
 * RUZIO - Auth Context
 * Manages authentication state across the app (Phone/OTP based)
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('ruzio_token');
    const savedUser = localStorage.getItem('ruzio_user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Request OTP for phone number
  const requestOTP = async (phone) => {
    const response = await authAPI.requestOTP({ phone });
    setPhoneNumber(phone);
    setOtpSent(true);
    return response.data;
  };

  // Verify OTP and login
  const verifyOTP = async (phone, otp) => {
    const response = await authAPI.verifyOTP({ phone, otp });
    const { user, token, isNewUser } = response.data.data;
    
    localStorage.setItem('ruzio_token', token);
    localStorage.setItem('ruzio_user', JSON.stringify(user));
    setUser(user);
    setOtpSent(false);
    setPhoneNumber('');
    
    return { user, isNewUser };
  };

  // Legacy login with phone/password (fallback)
  const login = async (phone, password) => {
    const response = await authAPI.login({ phone, password });
    const { user, token } = response.data.data;
    
    localStorage.setItem('ruzio_token', token);
    localStorage.setItem('ruzio_user', JSON.stringify(user));
    setUser(user);
    
    return user;
  };

  // Register new user (called after OTP verification if profile incomplete)
  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { user, token } = response.data.data;
    
    localStorage.setItem('ruzio_token', token);
    localStorage.setItem('ruzio_user', JSON.stringify(user));
    setUser(user);
    
    return user;
  };

  // Complete profile after OTP registration
  const completeProfile = async (profileData) => {
    const response = await authAPI.updateProfile(profileData);
    const updatedUser = response.data.data;
    
    localStorage.setItem('ruzio_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    return updatedUser;
  };

  const logout = () => {
    localStorage.removeItem('ruzio_token');
    localStorage.removeItem('ruzio_user');
    setUser(null);
    setOtpSent(false);
    setPhoneNumber('');
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('ruzio_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const resetOTPState = () => {
    setOtpSent(false);
    setPhoneNumber('');
  };

  const value = {
    user,
    loading,
    otpSent,
    phoneNumber,
    requestOTP,
    verifyOTP,
    login,
    register,
    completeProfile,
    logout,
    updateUser,
    resetOTPState,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}