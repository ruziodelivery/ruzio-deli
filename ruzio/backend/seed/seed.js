/**
 * RUZIO - Database Seed Script
 * Creates sample data for testing the prototype
 * 
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/database');
const { User, PlatformSettings, Restaurant, MenuItem, Order } = require('../models');
const { ROLES, ORDER_STATUS, DEFAULT_SETTINGS } = require('../config/constants');

// Sample data
const users = [
  // Admin
  {
    name: 'Admin User',
    email: 'admin@ruzio.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    isActive: true,
    isApproved: true
  },
  // Restaurant owners
  {
    name: 'Pizza Palace Owner',
    email: 'pizza@ruzio.com',
    password: 'password123',
    role: ROLES.RESTAURANT,
    phone: '555-0101',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Burger Barn Owner',
    email: 'burger@ruzio.com',
    password: 'password123',
    role: ROLES.RESTAURANT,
    phone: '555-0102',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Sushi Spot Owner',
    email: 'sushi@ruzio.com',
    password: 'password123',
    role: ROLES.RESTAURANT,
    phone: '555-0103',
    isActive: true,
    isApproved: true
  },
  // Delivery partners
  {
    name: 'Dave Delivery',
    email: 'dave@ruzio.com',
    password: 'password123',
    role: ROLES.DELIVERY,
    phone: '555-0201',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Sarah Speed',
    email: 'sarah@ruzio.com',
    password: 'password123',
    role: ROLES.DELIVERY,
    phone: '555-0202',
    isActive: true,
    isApproved: true
  },
  // Customers
  {
    name: 'John Customer',
    email: 'john@example.com',
    password: 'password123',
    role: ROLES.CUSTOMER,
    phone: '555-0301',
    address: '123 Main St, Downtown',
    isActive: true,
    isApproved: true
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: ROLES.CUSTOMER,
    phone: '555-0302',
    address: '456 Oak Ave, Suburb',
    isActive: true,
    isApproved: true
  }
];

const restaurants = [
  {
    name: 'Pizza Palace',
    description: 'Best pizzas in town! Wood-fired and delicious.',
    cuisine: 'Italian',
    address: '100 Pizza Lane',
    phone: '555-1001',
    isOpen: true,
    isApproved: true,
    avgPrepTime: 25,
    rating: 4.5
  },
  {
    name: 'Burger Barn',
    description: 'Juicy burgers made with 100% beef.',
    cuisine: 'American',
    address: '200 Burger Blvd',
    phone: '555-1002',
    isOpen: true,
    isApproved: true,
    avgPrepTime: 15,
    rating: 4.2
  },
  {
    name: 'Sushi Spot',
    description: 'Fresh sushi and Japanese cuisine.',
    cuisine: 'Japanese',
    address: '300 Sushi Street',
    phone: '555-1003',
    isOpen: false,
    isApproved: true,
    avgPrepTime: 30,
    rating: 4.8
  }
];

const menuItems = {
  'Pizza Palace': [
    { name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', price: 12.99, category: 'Pizza', isVeg: true },
    { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni', price: 14.99, category: 'Pizza', isVeg: false },
    { name: 'Veggie Supreme', description: 'All the veggies', price: 15.99, category: 'Pizza', isVeg: true },
    { name: 'Garlic Bread', description: 'Crispy garlic bread', price: 4.99, category: 'Sides', isVeg: true },
    { name: 'Caesar Salad', description: 'Fresh romaine with caesar dressing', price: 7.99, category: 'Salads', isVeg: true },
    { name: 'Tiramisu', description: 'Classic Italian dessert', price: 6.99, category: 'Desserts', isVeg: true }
  ],
  'Burger Barn': [
    { name: 'Classic Burger', description: 'Beef patty with lettuce and tomato', price: 9.99, category: 'Burgers', isVeg: false },
    { name: 'Cheese Burger', description: 'With melted cheddar cheese', price: 10.99, category: 'Burgers', isVeg: false },
    { name: 'Veggie Burger', description: 'Plant-based patty', price: 11.99, category: 'Burgers', isVeg: true },
    { name: 'Bacon Deluxe', description: 'Double patty with bacon', price: 14.99, category: 'Burgers', isVeg: false },
    { name: 'French Fries', description: 'Crispy golden fries', price: 3.99, category: 'Sides', isVeg: true },
    { name: 'Onion Rings', description: 'Battered onion rings', price: 4.99, category: 'Sides', isVeg: true },
    { name: 'Milkshake', description: 'Chocolate, vanilla or strawberry', price: 5.99, category: 'Drinks', isVeg: true }
  ],
  'Sushi Spot': [
    { name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, category: 'Rolls', isVeg: false },
    { name: 'Salmon Nigiri', description: '2 pieces of fresh salmon', price: 6.99, category: 'Nigiri', isVeg: false },
    { name: 'Tuna Sashimi', description: '5 pieces of fresh tuna', price: 12.99, category: 'Sashimi', isVeg: false },
    { name: 'Vegetable Roll', description: 'Cucumber, avocado, carrot', price: 7.99, category: 'Rolls', isVeg: true },
    { name: 'Miso Soup', description: 'Traditional miso soup', price: 3.99, category: 'Soups', isVeg: true },
    { name: 'Edamame', description: 'Steamed soybeans', price: 4.99, category: 'Appetizers', isVeg: true },
    { name: 'Green Tea', description: 'Hot green tea', price: 2.99, category: 'Drinks', isVeg: true }
  ]
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

    // Create platform settings
    console.log('Creating platform settings...');
    await PlatformSettings.create({
      commissionPercentage: DEFAULT_SETTINGS.commissionPercentage,
      baseDeliveryCharge: DEFAULT_SETTINGS.baseDeliveryCharge,
      perKmRate: DEFAULT_SETTINGS.perKmRate
    });

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    // Get restaurant owners
    const pizzaOwner = createdUsers.find(u => u.email === 'pizza@ruzio.com');
    const burgerOwner = createdUsers.find(u => u.email === 'burger@ruzio.com');
    const sushiOwner = createdUsers.find(u => u.email === 'sushi@ruzio.com');
    const owners = [pizzaOwner, burgerOwner, sushiOwner];

    // Create restaurants
    console.log('Creating restaurants...');
    const createdRestaurants = [];
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = await Restaurant.create({
        ...restaurants[i],
        owner: owners[i]._id
      });
      createdRestaurants.push(restaurant);
    }

    // Create menu items
    console.log('Creating menu items...');
    for (const restaurant of createdRestaurants) {
      const items = menuItems[restaurant.name];
      for (const item of items) {
        await MenuItem.create({
          ...item,
          restaurant: restaurant._id
        });
      }
    }

    // Create sample orders
    console.log('Creating sample orders...');
    const customer = createdUsers.find(u => u.email === 'john@example.com');
    const pizzaRestaurant = createdRestaurants.find(r => r.name === 'Pizza Palace');
    const pizzaMenu = await MenuItem.find({ restaurant: pizzaRestaurant._id });

    // Sample delivered order
    const settings = await PlatformSettings.getSettings();
    const distanceKm = 3.5;
    const itemsTotal = pizzaMenu[0].price + pizzaMenu[3].price; // Margherita + Garlic Bread
    const deliveryCharge = settings.baseDeliveryCharge + (distanceKm * settings.perKmRate);
    const totalAmount = itemsTotal + deliveryCharge;
    const adminCommission = (itemsTotal * settings.commissionPercentage) / 100;
    const restaurantEarning = itemsTotal - adminCommission;

    await Order.create({
      customer: customer._id,
      restaurant: pizzaRestaurant._id,
      deliveryPartner: createdUsers.find(u => u.email === 'dave@ruzio.com')._id,
      items: [
        {
          menuItem: pizzaMenu[0]._id,
          name: pizzaMenu[0].name,
          quantity: 1,
          price: pizzaMenu[0].price,
          subtotal: pizzaMenu[0].price
        },
        {
          menuItem: pizzaMenu[3]._id,
          name: pizzaMenu[3].name,
          quantity: 2,
          price: pizzaMenu[3].price,
          subtotal: pizzaMenu[3].price * 2
        }
      ],
      status: ORDER_STATUS.DELIVERED,
      deliveryAddress: '123 Main St, Downtown',
      distanceKm,
      itemsTotal,
      deliveryCharge,
      totalAmount,
      commissionPercentage: settings.commissionPercentage,
      adminCommission,
      restaurantEarning,
      acceptedAt: new Date(Date.now() - 3600000),
      preparingAt: new Date(Date.now() - 3300000),
      readyAt: new Date(Date.now() - 2700000),
      assignedAt: new Date(Date.now() - 2400000),
      pickedUpAt: new Date(Date.now() - 1800000),
      deliveredAt: new Date(Date.now() - 1200000)
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Admin:      admin@ruzio.com / admin123');
    console.log('Restaurant: pizza@ruzio.com / password123');
    console.log('Restaurant: burger@ruzio.com / password123');
    console.log('Delivery:   dave@ruzio.com / password123');
    console.log('Customer:   john@example.com / password123');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
