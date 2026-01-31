/**
 * RUZIO - User Model
 * Handles all user types: admin, restaurant, delivery, customer
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true, // Allow null for phone-only users
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  // OTP for phone verification
  otp: {
    code: {
      type: String,
      select: false
    },
    expiresAt: {
      type: Date,
      select: false
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.CUSTOMER
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Customers are auto-approved, others need admin approval
      return this.role === ROLES.CUSTOMER;
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  return obj;
};

module.exports = mongoose.model('User', userSchema);