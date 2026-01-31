/**
 * RUZIO - Platform Settings Model
 * Stores configurable platform settings (commission, delivery rates)
 */

const mongoose = require('mongoose');
const { DEFAULT_SETTINGS } = require('../config/constants');

const platformSettingsSchema = new mongoose.Schema({
  // Commission percentage that platform takes from each order
  commissionPercentage: {
    type: Number,
    required: true,
    default: DEFAULT_SETTINGS.commissionPercentage,
    min: [0, 'Commission cannot be negative'],
    max: [100, 'Commission cannot exceed 100%']
  },
  // Base delivery charge (flat fee)
  baseDeliveryCharge: {
    type: Number,
    required: true,
    default: DEFAULT_SETTINGS.baseDeliveryCharge,
    min: [0, 'Base delivery charge cannot be negative']
  },
  // Rate per kilometer for delivery
  perKmRate: {
    type: Number,
    required: true,
    default: DEFAULT_SETTINGS.perKmRate,
    min: [0, 'Per km rate cannot be negative']
  },
  // Last updated by admin
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists (singleton pattern)
platformSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      commissionPercentage: DEFAULT_SETTINGS.commissionPercentage,
      baseDeliveryCharge: DEFAULT_SETTINGS.baseDeliveryCharge,
      perKmRate: DEFAULT_SETTINGS.perKmRate
    });
  }
  return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
