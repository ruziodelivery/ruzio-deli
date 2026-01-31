/**
 * RUZIO - Order Details Page
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { Layout, Card, Button, Loading, ErrorMessage, OrderStatusBadge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getStatusTimeline = () => {
    const statuses = [
      { key: 'pending', label: 'Order Placed', time: order.createdAt },
      { key: 'accepted', label: 'Accepted', time: order.acceptedAt },
      { key: 'preparing', label: 'Preparing', time: order.preparingAt },
      { key: 'ready', label: 'Ready', time: order.readyAt },
      { key: 'assigned', label: 'Delivery Assigned', time: order.assignedAt },
      { key: 'picked_up', label: 'Picked Up', time: order.pickedUpAt },
      { key: 'delivered', label: 'Delivered', time: order.deliveredAt }
    ];

    const statusOrder = ['pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);

    return statuses.map((status, index) => ({
      ...status,
      completed: statusOrder.indexOf(status.key) <= currentIndex,
      active: status.key === order.status
    }));
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} /></Layout>;
  if (!order) return <Layout><ErrorMessage message="Order not found" /></Layout>;

  const timeline = getStatusTimeline();

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

            {/* Status Timeline */}
            {order.status !== 'rejected' && order.status !== 'cancelled' && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Order Status</h3>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {timeline.map((status, index) => (
                    <div key={status.key} className="flex items-center">
                      <div className={`flex flex-col items-center ${status.completed ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          status.active ? 'bg-primary-600 text-white' :
                          status.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {status.completed ? '✓' : index + 1}
                        </div>
                        <span className="text-xs mt-1 whitespace-nowrap">{status.label}</span>
                        {status.time && (
                          <span className="text-xs text-gray-400">
                            {new Date(status.time).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-8 h-0.5 ${status.completed ? 'bg-green-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
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
                <div key={index} className="flex justify-between py-2 border-b">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                  </div>
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Delivery Details</h3>
              <p className="text-sm text-gray-600">📍 {order.deliveryAddress}</p>
              <p className="text-sm text-gray-600">📏 Distance: {order.distanceKm} km</p>
              {order.deliveryPartner && (
                <p className="text-sm text-gray-600">
                  🚴 Delivery Partner: {order.deliveryPartner.name} ({order.deliveryPartner.phone || 'N/A'})
                </p>
              )}
              {order.customerNote && (
                <p className="text-sm text-gray-600">📝 Note: {order.customerNote}</p>
              )}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <h2 className="font-semibold mb-4">Payment Summary</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>${order.itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charge</span>
                <span>${order.deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium mb-2">Restaurant</h3>
              <p className="font-semibold">{order.restaurant?.name}</p>
              <p className="text-sm text-gray-600">{order.restaurant?.address}</p>
              <p className="text-sm text-gray-600">{order.restaurant?.phone}</p>
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
