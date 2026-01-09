/**
 * RUZIO - Register Page
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Card, Input, Select, Button, ErrorMessage } from '../components/ui';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'restaurant', label: 'Restaurant Owner' },
    { value: 'delivery', label: 'Delivery Partner' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const user = await register(registerData);
      toast.success('Registration successful!');
      
      // Show approval message for non-customer roles
      if (user.role !== 'customer') {
        toast('Your account needs admin approval', { icon: 'ℹ️' });
      }
      
      const routes = {
        admin: '/admin',
        restaurant: '/restaurant',
        delivery: '/delivery',
        customer: '/browse'
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h2 className="text-2xl font-bold text-center mb-6">Join RUZIO</h2>
          
          {error && <ErrorMessage message={error} />}
          
          <form onSubmit={handleSubmit} className="mt-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
            
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
              placeholder="Minimum 6 characters"
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
            
            <Select
              label="Register As"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              required
            />

            <Input
              label="Phone (Optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />

            {formData.role === 'customer' && (
              <Input
                label="Address (Optional)"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your delivery address"
              />
            )}
            
            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
          
          <p className="text-center mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Login here
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}
