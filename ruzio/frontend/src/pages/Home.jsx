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

      {/* Demo Info */}
      <Card className="mt-12">
        <h2 className="text-xl font-semibold mb-4">🔐 Demo Credentials</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Admin:</strong> admin@ruzio.com / admin123</p>
            <p><strong>Restaurant:</strong> pizza@ruzio.com / password123</p>
          </div>
          <div>
            <p><strong>Delivery:</strong> dave@ruzio.com / password123</p>
            <p><strong>Customer:</strong> john@example.com / password123</p>
          </div>
        </div>
      </Card>

      {/* Prototype Notice */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-yellow-800">
          ⚠️ This is a <strong>prototype</strong> for validation purposes. 
          Features like real payment processing and map integration are mocked.
        </p>
      </div>
    </Layout>
  );
}
