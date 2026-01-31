# 🍕 RUZIO - Food Delivery Platform

**Prototype v1** - A multi-role food delivery platform built with Node.js, Express, MongoDB, React, and Tailwind CSS.

## 📋 Overview

RUZIO is a prototype food delivery platform designed to validate:
- Multi-role system (Admin, Restaurant, Delivery Partner, Customer)
- Complete order flow from placement to delivery
- Commission and delivery charge calculation logic
- Role-based access control

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Auth | JWT-based authentication |
| API | RESTful |

## 📁 Project Structure

```
ruzio/
├── backend/
│   ├── config/           # Database & constants
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, validation, errors
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── seed/             # Sample data
│   └── server.js         # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── context/      # React contexts (Auth, Cart)
    │   ├── pages/        # Page components
    │   ├── services/     # API calls
    │   └── App.jsx       # Main app with routes
    └── index.html
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd ruzio/backend

# Install dependencies
npm install

# Configure environment (copy and edit)
cp .env.example .env
# Edit .env with your MongoDB URI

# Seed the database with sample data
npm run seed

# Start the server
npm run dev
```

The backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd ruzio/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs on `http://localhost:5173`

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ruzio.com | admin123 |
| Restaurant | pizza@ruzio.com | password123 |
| Restaurant | burger@ruzio.com | password123 |
| Delivery | dave@ruzio.com | password123 |
| Customer | john@example.com | password123 |

## 👥 User Roles & Features

### 🔑 Admin
- Configure platform settings (commission %, delivery rates)
- View and manage all users
- Approve/block restaurants and delivery partners
- View all orders and platform earnings

### 🏪 Restaurant Owner
- Create and manage restaurant profile
- Add/edit/delete menu items
- Accept or reject incoming orders
- Update order status (preparing → ready)
- View earnings and statistics

### 🚴 Delivery Partner
- View available orders ready for pickup
- Accept delivery assignments
- Update delivery status (picked up → delivered)
- View delivery history and earnings

### 👤 Customer
- Browse open restaurants
- View menus and add items to cart
- Set delivery distance (mocked)
- Place orders with delivery address
- Track order status in real-time
- Cancel pending orders

## 💰 Pricing Logic

### Delivery Charge Calculation
```
delivery_charge = baseDeliveryCharge + (distance_km × perKmRate)
```

Example with default settings (base=$20, rate=$5/km):
- 3 km delivery: $20 + (3 × $5) = $35

### Commission Calculation
```
admin_commission = items_total × (commissionPercentage / 100)
restaurant_earning = items_total - admin_commission
```

Example with 10% commission on $50 order:
- Commission: $50 × 0.10 = $5
- Restaurant earning: $50 - $5 = $45

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/auth/profile | Get current user |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/settings | Get platform settings |
| PUT | /api/admin/settings | Update settings |
| GET | /api/admin/users | List all users |
| PUT | /api/admin/users/:id/approve | Approve user |
| PUT | /api/admin/users/:id/block | Block user |
| GET | /api/admin/earnings | Get statistics |

### Restaurant
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/restaurant | List restaurants |
| GET | /api/restaurant/:id | Get restaurant |
| GET | /api/restaurant/:id/menu | Get menu |
| POST | /api/restaurant | Create restaurant |
| POST | /api/restaurant/:id/menu | Add menu item |
| PUT | /api/restaurant/orders/:id/accept | Accept order |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order |
| POST | /api/orders/estimate | Get price estimate |
| GET | /api/orders/my-orders | Customer orders |
| GET | /api/orders/:id | Get order details |
| PUT | /api/orders/:id/cancel | Cancel order |

### Delivery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/delivery/available | Available orders |
| PUT | /api/delivery/accept/:id | Accept delivery |
| GET | /api/delivery/active | Current delivery |
| PUT | /api/delivery/status/:id | Update status |

## 📊 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'restaurant' | 'delivery' | 'customer',
  isActive: Boolean,
  isApproved: Boolean
}
```

### PlatformSettings (Singleton)
```javascript
{
  commissionPercentage: Number (default: 10),
  baseDeliveryCharge: Number (default: 20),
  perKmRate: Number (default: 5)
}
```

### Order
```javascript
{
  orderNumber: String,
  customer: ObjectId,
  restaurant: ObjectId,
  deliveryPartner: ObjectId,
  items: [{ menuItem, name, quantity, price, subtotal }],
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'assigned' | 'picked_up' | 'delivered',
  distanceKm: Number,
  itemsTotal: Number,
  deliveryCharge: Number,
  totalAmount: Number,
  adminCommission: Number,
  restaurantEarning: Number
}
```

## 🔄 Order Flow

```
1. Customer places order → status: PENDING
2. Restaurant accepts → status: ACCEPTED
3. Restaurant starts cooking → status: PREPARING
4. Food ready → status: READY
5. Delivery partner accepts → status: ASSIGNED
6. Partner picks up → status: PICKED_UP
7. Partner delivers → status: DELIVERED
```

Alternative flows:
- Restaurant rejects → status: REJECTED
- Customer cancels (if pending) → status: CANCELLED

## ⚠️ Prototype Limitations

This is a **prototype** with intentional limitations:

1. **No Real Maps**: Distance is manually entered (mocked value)
2. **No Real Payments**: Payment processing is simulated
3. **No Real-time Updates**: Uses polling instead of WebSocket
4. **No Image Uploads**: Menu items don't have actual images
5. **Basic Validation**: Minimal input validation
6. **No Email/SMS**: No notification system
7. **Single Restaurant per Owner**: Limitation for simplicity

## 🔮 Future Enhancements

For production, consider adding:
- [ ] Real maps integration (Google Maps API)
- [ ] Payment gateway (Stripe, Razorpay)
- [ ] Real-time updates (Socket.io)
- [ ] Image upload (Cloudinary, S3)
- [ ] Email/SMS notifications
- [ ] Reviews and ratings
- [ ] Coupons and promotions
- [ ] Advanced search and filters
- [ ] Mobile app (React Native)

## 📝 License

This project is for educational/prototype purposes only.

---

Built with ❤️ for validating food delivery platform concepts.
