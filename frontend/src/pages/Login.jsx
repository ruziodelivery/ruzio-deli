/**
 * RUZIO - Login Page
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Card, Input, Button, ErrorMessage } from '../components/ui';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success('Login successful!');
      
      // Redirect based on role
      const routes = {
        admin: '/admin',
        restaurant: '/restaurant',
        delivery: '/delivery',
        customer: '/browse'
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <h2 className="text-2xl font-bold text-center mb-6">Login to RUZIO</h2>
          
          {error && <ErrorMessage message={error} />}
          
          <form onSubmit={handleSubmit} className="mt-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            
            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register here
            </Link>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
            <p className="font-medium mb-2">Demo Accounts:</p>
            <p>Admin: admin@ruzio.com / admin123</p>
            <p>Restaurant: pizza@ruzio.com / password123</p>
            <p>Delivery: dave@ruzio.com / password123</p>
            <p>Customer: john@example.com / password123</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
