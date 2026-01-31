
/**
 * RUZIO - Database Seed Script
 * Creates initial admin and platform settings
 * 
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const { User, PlatformSettings, Restaurant, MenuItem, Order, Notification } = require('../models');
const { ROLES, ORDER_STATUS, DEFAULT_SETTINGS } = require('../config/constants');

// Initial admin user (phone-based)
const adminUser = {
  name: 'RUZIO Admin',
  phone: '9999999999',
  role: ROLES.ADMIN,
  isActive: true,
  isApproved: true,
  otp: { verified: true }
};

// Seed function
async function seedDatabase() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database...');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await PlatformSettings.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});

    // Create platform settings
    console.log('Creating platform settings...');
    await PlatformSettings.create({
      commissionPercentage: DEFAULT_SETTINGS.commissionPercentage,
      baseDeliveryCharge: DEFAULT_SETTINGS.baseDeliveryCharge,
      perKmRate: DEFAULT_SETTINGS.perKmRate,
      platformFeePercentage: DEFAULT_SETTINGS.platformFeePercentage
    });

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create(adminUser);
    console.log(`Admin created with phone: ${admin.phone}`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📱 Admin Login:');
    console.log('   Phone: +91 9999999999');
    console.log('   (Use OTP login - check console/SMS for OTP)');
    console.log('\n💡 Platform Settings:');
    console.log(`   Default Commission: ${DEFAULT_SETTINGS.commissionPercentage}%`);
    console.log(`   Platform Fee: ${DEFAULT_SETTINGS.platformFeePercentage}%`);
    console.log(`   Base Delivery: ₹${DEFAULT_SETTINGS.baseDeliveryCharge}`);
    console.log(`   Per KM Rate: ₹${DEFAULT_SETTINGS.perKmRate}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
