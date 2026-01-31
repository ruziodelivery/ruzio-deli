/**
 * RUZIO - Register Page (Phone OTP Based)
 */

import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Card, Input, Select, Button, ErrorMessage } from '../components/ui';
import toast from 'react-hot-toast';

export default function Register() {
  const [searchParams] = useSearchParams();
  const isCompleteProfile = searchParams.get('complete') === 'true';
  
  const [step, setStep] = useState(isCompleteProfile ? 'profile' : 'phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: 'customer',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOTP, verifyOTP, completeProfile, user } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'restaurant', label: 'Restaurant Owner' },
    { value: 'delivery', label: 'Delivery Partner' }
  ];

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await requestOTP(phone, formData.name, formData.role);
      setStep('otp');
      toast.success('OTP sent to your mobile!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user: newUser } = await verifyOTP(phone, otp);
      toast.success('Registration successful!');
      
      // Show approval message for non-customer roles
      if (newUser.role !== 'customer') {
        toast('Your account needs admin approval', { icon: 'ℹ️' });
      }
      
      const routes = {
        admin: '/admin',
        restaurant: '/restaurant',
        delivery: '/delivery',
        customer: '/browse'
      };
      navigate(routes[newUser.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updatedUser = await completeProfile(formData);
      toast.success('Profile updated!');
      
      const routes = {
        admin: '/admin',
        restaurant: '/restaurant',
        delivery: '/delivery',
        customer: '/browse'
      };
      navigate(routes[updatedUser.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Complete profile step (for users who registered via OTP but need to add details)
  if (step === 'profile' || isCompleteProfile) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10">
          <Card>
            <h2 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h2>
            
            {error && <ErrorMessage message={error} />}
            
            <form onSubmit={handleCompleteProfile} className="mt-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />

              {formData.role === 'customer' && (
                <Input
                  label="Delivery Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your delivery address"
                />
              )}
              
              <Button type="submit" disabled={loading} className="w-full mt-4">
                {loading ? 'Saving...' : 'Complete Registration'}
              </Button>
            </form>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <h2 className="text-2xl font-bold text-center mb-6">Join RUZIO</h2>
          
          {error && <ErrorMessage message={error} />}
          
          {step === 'phone' && (
            <form onSubmit={handleRequestOTP} className="mt-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    maxLength={10}
                  />
                </div>
              </div>
              
              <Select
                label="Register As"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={roleOptions}
                required
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
              
              <Button type="submit" disabled={loading || phone.length !== 10} className="w-full mt-4">
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="mt-4">
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  OTP sent to <strong>+91 {phone}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="text-sm text-primary-600 hover:underline mt-1"
                >
                  Change number
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
                  required
                  maxLength={6}
                />
              </div>

              <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
                {loading ? 'Verifying...' : 'Verify & Register'}
              </Button>

              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="w-full mt-3 text-sm text-primary-600 hover:underline"
              >
                Resend OTP
              </button>
            </form>
          )}
          
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