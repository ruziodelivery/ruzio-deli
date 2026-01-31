/**
 * RUZIO - Admin Dashboard
 */

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Layout, Card, Button, Input, StatCard, Loading, ErrorMessage, Badge, Modal } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'overview') {
        const [statsRes, settingsRes] = await Promise.all([
          adminAPI.getEarnings(),
          adminAPI.getSettings()
        ]);
        setStats(statsRes.data.data);
        setSettings(settingsRes.data.data);
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        setUsers(res.data.data);
      } else if (activeTab === 'restaurants') {
        const res = await adminAPI.getRestaurants();
        setRestaurants(res.data.data);
      } else if (activeTab === 'orders') {
        const res = await adminAPI.getOrders();
        setOrders(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('User approved!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve user');
    }
  };

  const handleToggleBlock = async (userId, isActive) => {
    try {
      if (isActive) {
        await adminAPI.blockUser(userId);
        toast.success('User blocked');
      } else {
        await adminAPI.unblockUser(userId);
        toast.success('User unblocked');
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleApproveRestaurant = async (restaurantId) => {
    try {
      await adminAPI.approveRestaurant(restaurantId);
      toast.success('Restaurant approved!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'users', label: '👥 Users' },
    { id: 'restaurants', label: '🏪 Restaurants' },
    { id: 'orders', label: '📦 Orders' }
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded whitespace-nowrap ${
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

      {/* Overview Tab */}
      {!loading && activeTab === 'overview' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" />
            <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon="💰" />
            <StatCard title="Commission Earned" value={`$${stats.totalCommission.toFixed(2)}`} icon="📈" />
            <StatCard title="Active Restaurants" value={stats.activeRestaurants} icon="🏪" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Customers" value={stats.totalCustomers} icon="👤" />
            <StatCard title="Delivery Partners" value={stats.totalDeliveryPartners} icon="🚴" />
            <StatCard title="Total Restaurants" value={stats.totalRestaurants} icon="🍽️" />
            <StatCard title="Delivery Charges" value={`$${stats.totalDeliveryCharges.toFixed(2)}`} icon="🚗" />
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {!loading && activeTab === 'settings' && settings && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
          <form onSubmit={handleUpdateSettings}>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Commission (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.commissionPercentage}
                  onChange={(e) => setSettings({ ...settings, commissionPercentage: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Delivery Charge ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={settings.baseDeliveryCharge}
                  onChange={(e) => setSettings({ ...settings, baseDeliveryCharge: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Per KM Rate ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={settings.perKmRate}
                  onChange={(e) => setSettings({ ...settings, perKmRate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <Button type="submit" className="mt-4">Save Settings</Button>
          </form>
        </Card>
      )}

      {/* Users Tab */}
      {!loading && activeTab === 'users' && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <Badge variant="primary">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-2">
                      {user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Blocked</Badge>
                      )}
                      {!user.isApproved && <Badge variant="warning">Pending</Badge>}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {!user.isApproved && user.role !== 'admin' && (
                        <Button variant="success" onClick={() => handleApproveUser(user._id)}>
                          Approve
                        </Button>
                      )}
                      {user.role !== 'admin' && (
                        <Button
                          variant={user.isActive ? 'danger' : 'secondary'}
                          onClick={() => handleToggleBlock(user._id, user.isActive)}
                        >
                          {user.isActive ? 'Block' : 'Unblock'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Restaurants Tab */}
      {!loading && activeTab === 'restaurants' && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Restaurant Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Owner</th>
                  <th className="px-4 py-2 text-left">Cuisine</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(restaurant => (
                  <tr key={restaurant._id} className="border-b">
                    <td className="px-4 py-2">{restaurant.name}</td>
                    <td className="px-4 py-2">{restaurant.owner?.name}</td>
                    <td className="px-4 py-2">{restaurant.cuisine}</td>
                    <td className="px-4 py-2">
                      {restaurant.isApproved ? (
                        restaurant.isOpen ? (
                          <Badge variant="success">Open</Badge>
                        ) : (
                          <Badge variant="warning">Closed</Badge>
                        )
                      ) : (
                        <Badge variant="danger">Pending Approval</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {!restaurant.isApproved && (
                        <Button variant="success" onClick={() => handleApproveRestaurant(restaurant._id)}>
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Orders Tab */}
      {!loading && activeTab === 'orders' && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">All Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Order #</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Restaurant</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Commission</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b">
                    <td className="px-4 py-2">{order.orderNumber}</td>
                    <td className="px-4 py-2">{order.customer?.name}</td>
                    <td className="px-4 py-2">{order.restaurant?.name}</td>
                    <td className="px-4 py-2">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-2">${order.adminCommission.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <Badge variant={order.status === 'delivered' ? 'success' : 'primary'}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Layout>
  );
}
