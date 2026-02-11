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
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new ApiError('Invalid Indian mobile number', 400);
  }

  let user = await User.findOne({ phone });

  if (!user && !name) {
    throw new ApiError('Name is required for new registration', 400);
  }

  // Call 2Factor AUTOGEN
  const response = await axios.get(
    `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`
  );

  if (response.data.Status !== "Success") {
    console.error("2Factor Error:", response.data);
    throw new ApiError("Failed to send OTP", 500);
  }

  const sessionId = response.data.Details;

  if (!user) {
    user = await User.create({
      name,
      phone,
      role,
      otp: {
        sessionId,
        verified: false
      }
    });
  } else {
    user.otp = {
      sessionId,
      verified: false
    };
    await user.save();
  }

  return {
    message: "OTP sent successfully",
    phone
  };
};
/**
 * Verify OTP and login
 */
const verifyOTP = async (phone, otp) => {
  const user = await User.findOne({ phone });

  if (!user || !user.otp?.sessionId) {
    throw new ApiError("Please request OTP first", 400);
  }

  const response = await axios.get(
    `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${user.otp.sessionId}/${otp}`
  );

  if (response.data.Status !== "Success") {
    throw new ApiError("Invalid OTP", 400);
  }

  user.otp = {
    sessionId: null,
    verified: true
  };

  await user.save();

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