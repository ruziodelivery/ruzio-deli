/**
 * RUZIO - Landing Page
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Card, Button } from '../components/ui';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/browse';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'restaurant': return '/restaurant';
      case 'delivery': return '/delivery';
      case 'customer': return '/customer';
      default: return '/customer';
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-primary-600 mb-4">
          🍕 RUZIO
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Food Delivery Platform - Prototype v1
        </p>
        
        {isAuthenticated ? (
          <Link to={getDashboardLink()}>
            <Button className="text-lg px-8 py-3">
              Go to Dashboard →
            </Button>
          </Link>
        ) : (
          <div className="space-x-4">
            <Link to="/login">
              <Button className="text-lg px-8 py-3">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" className="text-lg px-8 py-3">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-4 gap-6 mt-12">
        <Card className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="font-semibold mb-2">Customer</h3>
          <p className="text-sm text-gray-600">
            Browse restaurants, order food, track delivery
          </p>
        </Card>
        
        <Card className="text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="font-semibold mb-2">Restaurant</h3>
          <p className="text-sm text-gray-600">
            Manage menu, accept orders, track earnings
          </p>
        </Card>
        
        <Card className="text-center">
          <div className="text-4xl mb-4">🚴</div>
          <h3 className="font-semibold mb-2">Delivery</h3>
          <p className="text-sm text-gray-600">
            Accept deliveries, navigate, complete orders
          </p>
        </Card>
        
        <Card className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="font-semibold mb-2">Admin</h3>
          <p className="text-sm text-gray-600">
            Manage platform, set commission rates
          </p>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mt-12">
        <h2 className="text-xl font-semibold mb-4">📱 How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl mb-2">1️⃣</div>
            <h4 className="font-semibold mb-1">Sign Up with Phone</h4>
            <p className="text-sm text-gray-600">Quick registration with OTP verification</p>
          </div>
          <div>
            <div className="text-3xl mb-2">2️⃣</div>
            <h4 className="font-semibold mb-1">Browse & Order</h4>
            <p className="text-sm text-gray-600">Find restaurants, add items, place order</p>
          </div>
          <div>
            <div className="text-3xl mb-2">3️⃣</div>
            <h4 className="font-semibold mb-1">Track & Receive</h4>
            <p className="text-sm text-gray-600">Track your order in real-time</p>
          </div>
        </div>
      </Card>

      {/* Download App CTA */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-center text-white">
        <h3 className="text-xl font-bold mb-2">📲 Download the RUZIO App</h3>
        <p className="mb-4 opacity-90">Get a better experience on our mobile app</p>
        <div className="flex justify-center gap-4">
          <button className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            🍎 App Store
          </button>
          <button className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            🤖 Play Store
          </button>
        </div>
      </div>
    </Layout>
  );
}