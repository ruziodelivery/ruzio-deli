/**
 * RUZIO - Order Model
 * Complete order with items, charges, and status tracking
 */

const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../config/constants');

// Sub-schema for order items
const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  // Calculated: quantity * price
  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Order number for display
  orderNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Order items array
  items: [orderItemSchema],
  
  // Order status
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING
  },
  
  // Delivery address
  deliveryAddress: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  
  // Distance in kilometers (mocked value)
  distanceKm: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0.1, 'Distance must be at least 0.1 km']
  },
  
  // Financial calculations
  itemsTotal: {
    type: Number,
    required: true
  },
  deliveryCharge: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Commission tracking
  commissionPercentage: {
    type: Number,
    required: true
  },
  adminCommission: {
    type: Number,
    required: true
  },
  restaurantEarning: {
    type: Number,
    required: true
  },
  
  // Status timestamps
  acceptedAt: Date,
  rejectedAt: Date,
  preparingAt: Date,
  readyAt: Date,
  assignedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Notes
  customerNote: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters']
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `RUZ${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for common queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
