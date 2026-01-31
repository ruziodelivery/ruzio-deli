/**
 * RUZIO - Delivery Partner Dashboard
 */

import { useState, useEffect } from 'react';
import { deliveryAPI } from '../../services/api';
import { Layout, Card, Button, StatCard, Loading, ErrorMessage, OrderStatusBadge, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const [activeTab, setActiveTab] = useState('available');
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'available') {
        const [availRes, activeRes] = await Promise.all([
          deliveryAPI.getAvailable(),
          deliveryAPI.getActive()
        ]);
        setAvailableOrders(availRes.data.data);
        setActiveDelivery(activeRes.data.data);
      } else if (activeTab === 'history') {
        const res = await deliveryAPI.getHistory();
        setHistory(res.data.data);
      } else if (activeTab === 'stats') {
        const res = await deliveryAPI.getStats();
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      await deliveryAPI.accept(orderId);
      toast.success('Delivery accepted!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept delivery');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await deliveryAPI.updateStatus(orderId, status);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const tabs = [
    { id: 'available', label: '📋 Available Orders' },
    { id: 'history', label: '📜 History' },
    { id: 'stats', label: '📊 Statistics' }
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>

      {/* Active Delivery Banner */}
      {activeDelivery && (
        <Card className="mb-6 border-2 border-primary-500 bg-primary-50">
          <h2 className="text-lg font-semibold mb-2">🚴 Active Delivery</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">Order #{activeDelivery.orderNumber}</p>
              <p className="text-sm text-gray-600">
                From: {activeDelivery.restaurant?.name} - {activeDelivery.restaurant?.address}
              </p>
              <p className="text-sm text-gray-600">
                To: {activeDelivery.customer?.name} - {activeDelivery.deliveryAddress}
              </p>
              <p className="text-sm text-gray-600">
                Customer Phone: {activeDelivery.customer?.phone || 'N/A'}
              </p>
              <p className="font-bold mt-2">Delivery Charge: ${activeDelivery.deliveryCharge.toFixed(2)}</p>
            </div>
            <OrderStatusBadge status={activeDelivery.status} />
          </div>
          <div className="flex space-x-2 mt-4">
            {activeDelivery.status === 'assigned' && (
              <Button onClick={() => handleUpdateStatus(activeDelivery._id, 'picked_up')}>
                🏪 Picked Up
              </Button>
            )}
            {activeDelivery.status === 'picked_up' && (
              <Button variant="success" onClick={() => handleUpdateStatus(activeDelivery._id, 'delivered')}>
                ✅ Mark Delivered
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <Loading />}

      {/* Available Orders Tab */}
      {!loading && activeTab === 'available' && (
        <div>
          {activeDelivery && (
            <div className="mb-4 p-4 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-yellow-800">
                ⚠️ Complete your current delivery before accepting a new one.
              </p>
            </div>
          )}
          
          {availableOrders.length === 0 ? (
            <EmptyState message="No available orders right now" icon="📭" />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {availableOrders.map(order => (
                <Card key={order._id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        Restaurant: {order.restaurant?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Pickup: {order.restaurant?.address}
                      </p>
                      <p className="text-sm text-gray-500">
                        Deliver to: {order.deliveryAddress}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Distance: {order.distanceKm} km</p>
                    <p className="font-bold text-primary-600">
                      Delivery Charge: ${order.deliveryCharge.toFixed(2)}
                    </p>
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={() => handleAcceptDelivery(order._id)}
                    disabled={!!activeDelivery}
                  >
                    Accept Delivery
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {!loading && activeTab === 'history' && (
        <div>
          {history.length === 0 ? (
            <EmptyState message="No completed deliveries yet" icon="📜" />
          ) : (
            <div className="space-y-4">
              {history.map(order => (
                <Card key={order._id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {order.restaurant?.name} → {order.customer?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Delivered: {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <OrderStatusBadge status={order.status} />
                      <p className="font-bold text-green-600 mt-2">
                        +${order.deliveryCharge.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {!loading && activeTab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Total Deliveries" value={stats.totalDeliveries} icon="📦" />
          <StatCard title="Pending Pickups" value={stats.pendingPickups} icon="⏳" />
          <StatCard 
            title="Total Earnings" 
            value={`$${stats.totalDeliveryEarnings.toFixed(2)}`} 
            icon="💰" 
          />
        </div>
      )}
    </Layout>
  );
}
