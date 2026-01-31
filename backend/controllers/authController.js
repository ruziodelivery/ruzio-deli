/**
 * RUZIO - Auth Controller
 * Handles authentication endpoints with OTP support
 */

const { authService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Request OTP for login/signup
 * @route   POST /api/auth/request-otp
 * @access  Public
 */
const requestOTP = asyncHandler(async (req, res) => {
  const { phone, name, role } = req.body;
  const result = await authService.requestOTP(phone, name, role);

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      phone: result.phone,
      isNewUser: result.isNewUser
    }
  });
});

/**
 * @desc    Verify OTP and login
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const result = await authService.verifyOTP(phone, otp);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * @desc    Register new user (legacy - for testing)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: result
  });
});

/**
 * @desc    Login user (legacy - for testing)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;
  const result = await authService.login(phone, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

module.exports = {
  requestOTP,
  verifyOTP,
  register,
  login,
  getProfile,
  updateProfile
};