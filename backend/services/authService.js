/**
 * RUZIO - Auth Service
 * Business logic for authentication
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { ROLES } = require('../config/constants');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Register a new user
 */
const register = async (userData) => {
  const { email, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('Email already registered', 400);
  }

  // Create user
  const user = await User.create(userData);

  // Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError('Your account has been deactivated', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  // Prevent role/admin changes through profile update
  delete updateData.role;
  delete updateData.isActive;
  delete updateData.isApproved;
  delete updateData.password;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  return user;
};

module.exports = {
  generateToken,
  register,
  login,
  getProfile,
  updateProfile
};
