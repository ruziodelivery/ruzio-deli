/**
 * RUZIO - Auth Service
 * Business logic for authentication with OTP support
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { ROLES} = require('../config/constants');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Generate OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Fast2SMS
 */
const sendOTP = async (phone, otp) => {
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/${otp}`
    );

    if (response.data.Status !== "Success") {
      throw new Error("2Factor OTP failed");
    }

    return true;
  } catch (error) {
    console.error("2Factor Error:", error.response?.data || error.message);

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
      return true;
    }

    throw new ApiError("Failed to send OTP. Please try again.", 500);
  }
};


/**
 * Request OTP for login/signup
 */
const requestOTP = async (phone, name = null, role = ROLES.CUSTOMER) => {
  // Validate phone number format (10 digit Indian mobile)
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new ApiError('Please enter a valid 10-digit Indian mobile number', 400);
  }

  // Check if user exists
  let user = await User.findOne({ phone });
  
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  if (user) {
    // Existing user - just update OTP
    user.otp = {
      code: otp,
      expiresAt: otpExpiry,
      verified: false
    };
    await user.save();
  } else {
    // New user - create with pending status
    if (!name) {
      throw new ApiError('Name is required for new registration', 400);
    }
    user = await User.create({
      name,
      phone,
      role,
      otp: {
        code: otp,
        expiresAt: otpExpiry,
        verified: false
      }
    });
  }

  // Send OTP
  await sendOTP(phone, otp);

  return {
    message: 'OTP sent successfully',
    isNewUser: !user.otp?.verified,
    phone
  };
};

/**
 * Verify OTP and login
 */
const verifyOTP = async (phone, otp) => {
  const user = await User.findOne({ phone }).select('+otp.code +otp.expiresAt');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!user.otp?.code) {
    throw new ApiError('Please request a new OTP', 400);
  }

  if (new Date() > user.otp.expiresAt) {
    throw new ApiError('OTP has expired. Please request a new one.', 400);
  }

  if (user.otp.code !== otp) {
    throw new ApiError('Invalid OTP', 400);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError('Your account has been deactivated', 401);
  }

  // Mark OTP as verified and clear it
  user.otp = {
    code: null,
    expiresAt: null,
    verified: true
  };
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Register a new user (legacy - email/password)
 */
const register = async (userData) => {
  const { phone } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new ApiError('Phone number already registered', 400);
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
 * Login user (legacy - email/password)
 */
const login = async (phone, password) => {
  // Find user by phone
  const user = await User.findOne({ phone }).select('+password');

  if (!user) {
    throw new ApiError('Invalid phone or password', 401);
  }

  // Check password if exists
  if (user.password) {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid phone or password', 401);
    }
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
  delete updateData.otp;

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
  requestOTP,
  verifyOTP,
  register,
  login,
  getProfile,
  updateProfile
};