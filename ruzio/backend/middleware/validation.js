/**
 * RUZIO - Validation Middleware
 * Input validation using express-validator
 */

const { body, param, validationResult } = require('express-validator');
const { ROLES, ORDER_STATUS } = require('../config/constants');

/**
 * Handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// Restaurant validations
const restaurantValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Restaurant name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('cuisine')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .trim(),
  validate
];

// Menu item validations
const menuItemValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim(),
  body('isVeg')
    .optional()
    .isBoolean().withMessage('isVeg must be a boolean'),
  body('isAvailable')
    .optional()
    .isBoolean().withMessage('isAvailable must be a boolean'),
  validate
];

// Order validations
const orderValidation = [
  body('restaurantId')
    .notEmpty().withMessage('Restaurant ID is required')
    .isMongoId().withMessage('Invalid restaurant ID'),
  body('items')
    .isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.menuItemId')
    .notEmpty().withMessage('Menu item ID is required')
    .isMongoId().withMessage('Invalid menu item ID'),
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress')
    .trim()
    .notEmpty().withMessage('Delivery address is required'),
  body('distanceKm')
    .notEmpty().withMessage('Distance is required')
    .isFloat({ min: 0.1 }).withMessage('Distance must be at least 0.1 km'),
  body('customerNote')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters'),
  validate
];

// Platform settings validations
const settingsValidation = [
  body('commissionPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Commission must be between 0 and 100'),
  body('baseDeliveryCharge')
    .optional()
    .isFloat({ min: 0 }).withMessage('Base delivery charge must be positive'),
  body('perKmRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Per km rate must be positive'),
  validate
];

// MongoDB ID validation
const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  restaurantValidation,
  menuItemValidation,
  orderValidation,
  settingsValidation,
  mongoIdValidation
};
