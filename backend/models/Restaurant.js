/**
 * RUZIO - Restaurant Model
 * Restaurant profiles linked to restaurant-role users
 */

const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Restaurant owner (user with restaurant role)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One restaurant per owner
  },
  cuisine: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Whether restaurant is currently accepting orders
  isOpen: {
    type: Boolean,
    default: false
  },
  // Admin approval status
  isApproved: {
    type: Boolean,
    default: false
  },
  // Commission percentage for this restaurant (admin configurable per restaurant)
  commissionPercentage: {
    type: Number,
    default: null, // null means use platform default
    min: [0, 'Commission cannot be negative'],
    max: [100, 'Commission cannot exceed 100%']
  },
  // Average preparation time in minutes
  avgPrepTime: {
    type: Number,
    default: 30,
    min: [5, 'Prep time must be at least 5 minutes']
  },
  // Rating (average of all reviews)
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Total number of ratings
  ratingCount: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
restaurantSchema.index({ isOpen: 1, isApproved: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);