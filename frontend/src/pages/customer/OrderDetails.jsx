/**
 * RUZIO - Order Details Page (Vertical Status, Rating, Delivery Partner Contact)
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { Layout, Card, Button, Loading, ErrorMessage, OrderStatusBadge, OrderStatusTracker, StarRating, formatCurrency } from '../../components/ui';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrder();
    // Poll for updates every 10 seconds for active orders
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getById(id);
      setOrder(res.data.data);
      if (res.data.data.rating) {
        setRating(res.data.data.rating);
        setReview(res.data.data.review || '');
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await orderAPI.cancel(id);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await orderAPI.submitRating(id, { rating, review });
      toast.success('Thank you for your feedback!');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', label: 'Order Placed', time: order.createdAt },
      { status: 'accepted', label: 'Order Accepted', time: order.acceptedAt },
      { status: 'preparing', label: 'Preparing Food', time: order.preparingAt },
      { status: 'ready', label: 'Ready for Pickup', time: order.readyAt },
      { status: 'assigned', label: 'Delivery Assigned', time: order.assignedAt },
      { status: 'picked_up', label: 'Out for Delivery', time: order.pickedUpAt },
      { status: 'delivered', label: 'Delivered', time: order.deliveredAt }
    ];
    return steps;
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} /></Layout>;
  if (!order) return <Layout><ErrorMessage message="Order not found" /></Layout>;

  const canRate = order.status === 'delivered' && !order.rating;
  const deliveryPartner = order.deliveryPartnerDetails || order.deliveryPartner;

  return (
    <Layout>
      <Link to="/orders" className="text-primary-600 hover:underline mb-4 block">
        ← Back to Orders
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Vertical Status Timeline */}
            {order.status !== 'rejected' && order.status !== 'cancelled' && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Order Status</h3>
                <OrderStatusTracker 
                  currentStatus={order.status} 
                  steps={getStatusSteps()}
                />
              </div>
            )}

            {order.status === 'rejected' && (
              <div className="mb-6 p-4 bg-red-50 rounded border border-red-200">
                <p className="text-red-800 font-medium">Order Rejected</p>
                {order.rejectionReason && (
                  <p className="text-red-600 text-sm">Reason: {order.rejectionReason}</p>
                )}
              </div>
            )}

            {/* Items */}
            <h3 className="font-medium mb-3">Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                    </div>
                  </div>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Delivery Details</h3>
              <p className="text-sm text-gray-600">📍 {order.deliveryAddress}</p>
              
              {/* Delivery Partner Contact */}
              {deliveryPartner && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">🚴 Delivery Partner</p>
                  <p className="text-sm">{deliveryPartner.name}</p>
                  {deliveryPartner.phone && (
                    <a 
                      href={`tel:${deliveryPartner.phone}`}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      📞 {deliveryPartner.phone} (Call Now)
                    </a>
                  )}
                </div>
              )}
              
              {order.customerNote && (
                <p className="text-sm text-gray-600 mt-2">📝 Note: {order.customerNote}</p>
              )}
            </div>

            {/* Rating Section */}
            {canRate && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-3">Rate Your Order</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">How was your food?</label>
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Write a review (optional)</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Tell us about your experience..."
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      rows="3"
                    />
                  </div>
                  <Button onClick={handleSubmitRating} disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Rating'}
                  </Button>
                </div>
              </div>
            )}

            {/* Already Rated */}
            {order.rating && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">Your Rating</h3>
                <StarRating value={order.rating} readonly />
                {order.review && (
                  <p className="text-sm text-gray-600 mt-2">"{order.review}"</p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <h2 className="font-semibold mb-4">Payment Summary</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>{formatCurrency(order.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charge</span>
                <span>{formatCurrency(order.deliveryCharge)}</span>
              </div>
              {order.platformFee > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Platform Fee</span>
                  <span>{formatCurrency(order.platformFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Restaurant</h3>
              <p className="font-semibold">{order.restaurant?.name}</p>
              <p className="text-sm text-gray-600">{order.restaurant?.address}</p>
              {order.restaurant?.phone && (
                <a 
                  href={`tel:${order.restaurant.phone}`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  📞 {order.restaurant.phone}
                </a>
              )}
            </div>

            {/* Cancel Button */}
            {order.status === 'pending' && (
              <Button variant="danger" onClick={handleCancel} className="w-full mt-4">
                Cancel Order
              </Button>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}