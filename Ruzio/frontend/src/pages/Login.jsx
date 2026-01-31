/**
 * RUZIO - Login Page (Phone OTP Based)
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, Card, Input, Button, ErrorMessage } from '../components/ui';
import toast from 'react-hot-toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      await requestOTP(phone);
      setOtpSent(true);
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
      const { user, isNewUser } = await verifyOTP(phone, otp);
      toast.success('Login successful!');
      
      if (isNewUser) {
        navigate('/register?complete=true');
        return;
      }
      
      // Redirect based on role
      const routes = {
        admin: '/admin',
        restaurant: '/restaurant',
        delivery: '/delivery',
        customer: '/browse'
      };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <h2 className="text-2xl font-bold text-center mb-6">Login to RUZIO</h2>
          
          {error && <ErrorMessage message={error} />}
          
          {!otpSent ? (
            <form onSubmit={handleRequestOTP} className="mt-4">
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
                <p className="text-xs text-gray-500 mt-1">We'll send you an OTP for verification</p>
              </div>
              
              <Button type="submit" disabled={loading || phone.length !== 10} className="w-full">
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="mt-4">
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  OTP sent to <strong>+91 {phone}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
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
                {loading ? 'Verifying...' : 'Verify & Login'}
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
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register here
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
}