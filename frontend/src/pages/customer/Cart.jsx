/**
 * RUZIO - Cart Page (Updated with INR, Platform Fee)
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI, settingsAPI } from '../../services/api';
import { Layout, Card, Button, Input, Loading, ErrorMessage, EmptyState, formatCurrency } from '../../components/ui';
import toast from 'react-hot-toast';

const PLATFORM_FEE_PERCENTAGE = 2.4;

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, getTotal } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const itemsTotal = getTotal();
  const deliveryFee = 30; // Fixed delivery fee in INR
  const platformFee = Number((itemsTotal * PLATFORM_FEE_PERCENTAGE / 100).toFixed(2));
  const grandTotal = itemsTotal + deliveryFee + platformFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const orderData = {
        restaurantId: cart.restaurantId,
        items: cart.items.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity
        })),
        deliveryAddress,
        customerNote
      };

      const res = await orderAPI.place(orderData);
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/orders/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <Layout>
        <EmptyState message="Your cart is empty" icon="🛒" />
        <div className="text-center mt-4">
          <Link to="/browse">
            <Button>Browse Restaurants</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">🛒 Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <h2 className="font-semibold">{cart.restaurantName}</h2>
                <p className="text-sm text-gray-500">{cart.items.length} item(s)</p>
              </div>
              <Button variant="danger" onClick={clearCart}>Clear Cart</Button>
            </div>

            {cart.items.map(item => (
              <div key={item._id} className="flex justify-between items-center py-3 border-b">
                <div className="flex items-center flex-1 gap-3">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-primary-600 font-semibold">{formatCurrency(item.price)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    🗑️
                  </button>
                </div>
                
                <p className="font-semibold ml-4 w-24 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <h2 className="font-semibold mb-4">Order Summary</h2>
            
            {error && <ErrorMessage message={error} />}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>{formatCurrency(itemsTotal)}</span>
              </div>
              
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              
              <div className="flex justify-between text-gray-500">
                <span>Platform Fee ({PLATFORM_FEE_PERCENTAGE}%)</span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Input
                label="Delivery Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                required
              />
              
              <label className="block text-sm font-medium mb-1">Note (Optional)</label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Any special instructions?"
                className="w-full px-3 py-2 border rounded text-sm"
                rows="2"
              />
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? 'Placing Order...' : `Pay ${formatCurrency(grandTotal)}`}
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}