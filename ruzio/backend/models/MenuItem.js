/**
 * RUZIO - MenuItem Model
 * Menu items belonging to restaurants
 */

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  // Whether item is currently available
  isAvailable: {
    type: Boolean,
    default: true
  },
  // Vegetarian flag
  isVeg: {
    type: Boolean,
    default: false
  },
  // Image URL (optional, for future use)
  image: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster restaurant menu queries
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
