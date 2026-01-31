/**
 * RUZIO - Admin Dashboard (With Commission Per Restaurant, Item Toggle, Delivery Info)
 */

import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Layout, Card, Button, Input, StatCard, Loading, ErrorMessage, Badge, Modal, ToggleSwitch, formatCurrency } from '../../components/ui';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commissionModal, setCommissionModal] = useState({ open: false, restaurant: null });
  const [newCommission, setNewCommission] = useState('');

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
      } else if (activeTab === 'menu') {
        const res = await adminAPI.getMenuItems();
        setMenuItems(res.data.data);
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

  const openCommissionModal = (restaurant) => {
    setCommissionModal({ open: true, restaurant });
    setNewCommission(restaurant.commissionPercentage?.toString() || settings?.commissionPercentage?.toString() || '');
  };

  const handleUpdateCommission = async () => {
    try {
      await adminAPI.updateRestaurantCommission(commissionModal.restaurant._id, parseFloat(newCommission));
      toast.success('Commission updated!');
      setCommissionModal({ open: false, restaurant: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update commission');
    }
  };

  const handleToggleMenuItem = async (itemId, currentStatus) => {
    try {
      await adminAPI.toggleMenuItem(itemId, !currentStatus);
      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle item');
    }
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'users', label: '👥 Users' },
    { id: 'restaurants', label: '🏪 Restaurants' },
    { id: 'menu', label: '🍔 Menu Items' },
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
            <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon="💰" />
            <StatCard title="Commission Earned" value={formatCurrency(stats.totalCommission)} icon="📈" />
            <StatCard title="Platform Fees" value={formatCurrency(stats.totalPlatformFees || 0)} icon="🎯" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Customers" value={stats.totalCustomers} icon="👤" />
            <StatCard title="Delivery Partners" value={stats.totalDeliveryPartners} icon="🚴" />
            <StatCard title="Active Restaurants" value={stats.activeRestaurants} icon="🏪" />
            <StatCard title="Delivery Charges" value={formatCurrency(stats.totalDeliveryCharges)} icon="🚗" />
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {!loading && activeTab === 'settings' && settings && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
          <form onSubmit={handleUpdateSettings}>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Default Commission (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.commissionPercentage}
                  onChange={(e) => setSettings({ ...settings, commissionPercentage: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Can be overridden per restaurant</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={settings.platformFeePercentage || 2.4}
                  onChange={(e) => setSettings({ ...settings, platformFeePercentage: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Charged to customers</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Delivery Charge (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={settings.baseDeliveryCharge}
                  onChange={(e) => setSettings({ ...settings, baseDeliveryCharge: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Per KM Rate (₹)</label>
                <input
                  type="number"
                  step="1"
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
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.phone || 'N/A'}</td>
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
                  <th className="px-4 py-2 text-left">Commission</th>
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
                      <span className="font-semibold text-primary-600">
                        {restaurant.commissionPercentage ?? settings?.commissionPercentage}%
                      </span>
                      {restaurant.commissionPercentage && (
                        <span className="text-xs text-gray-500 ml-1">(custom)</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {restaurant.isApproved ? (
                        restaurant.isOpen ? (
                          <Badge variant="success">Open</Badge>
                        ) : (
                          <Badge variant="warning">Closed</Badge>
                        )
                      ) : (
                        <Badge variant="danger">Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {!restaurant.isApproved && (
                        <Button variant="success" onClick={() => handleApproveRestaurant(restaurant._id)}>
                          Approve
                        </Button>
                      )}
                      <Button variant="secondary" onClick={() => openCommissionModal(restaurant)}>
                        Set Commission
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Menu Items Tab */}
      {!loading && activeTab === 'menu' && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Menu Items (ON/OFF Toggle)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Toggle items ON/OFF to enable or disable them across the platform. Disabled items won't appear for customers.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Image</th>
                  <th className="px-4 py-2 text-left">Item Name</th>
                  <th className="px-4 py-2 text-left">Restaurant</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Available</th>
                  <th className="px-4 py-2 text-left">Admin Toggle</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id} className="border-b">
                    <td className="px-4 py-2">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">🍽️</div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{item.name}</td>
                    <td className="px-4 py-2">{item.restaurant?.name}</td>
                    <td className="px-4 py-2">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-2">
                      <Badge variant={item.isAvailable ? 'success' : 'warning'}>
                        {item.isAvailable ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">
                      <ToggleSwitch 
                        checked={item.isActive !== false} 
                        onChange={() => handleToggleMenuItem(item._id, item.isActive !== false)}
                        label={item.isActive !== false ? 'ON' : 'OFF'}
                      />
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
                  <th className="px-4 py-2 text-left">Delivery Partner</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Commission</th>
                  <th className="px-4 py-2 text-left">Platform Fee</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-2">
                      <div>{order.customer?.name}</div>
                      <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-2">{order.restaurant?.name}</td>
                    <td className="px-4 py-2">
                      {order.deliveryPartnerDetails ? (
                        <div>
                          <div>{order.deliveryPartnerDetails.name}</div>
                          <a href={`tel:${order.deliveryPartnerDetails.phone}`} className="text-xs text-blue-600 hover:underline">
                            📞 {order.deliveryPartnerDetails.phone}
                          </a>
                        </div>
                      ) : order.deliveryPartner ? (
                        <div>
                          <div>{order.deliveryPartner.name}</div>
                          <a href={`tel:${order.deliveryPartner.phone}`} className="text-xs text-blue-600 hover:underline">
                            📞 {order.deliveryPartner.phone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-2 text-green-600">{formatCurrency(order.adminCommission)}</td>
                    <td className="px-4 py-2 text-blue-600">{formatCurrency(order.platformFee || 0)}</td>
                    <td className="px-4 py-2">
                      <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'primary'}>
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

      {/* Commission Modal */}
      {commissionModal.open && (
        <Modal onClose={() => setCommissionModal({ open: false, restaurant: null })}>
          <h3 className="text-lg font-semibold mb-4">
            Set Commission for {commissionModal.restaurant?.name}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Commission Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={newCommission}
              onChange={(e) => setNewCommission(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Platform default: {settings?.commissionPercentage}%
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setCommissionModal({ open: false, restaurant: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCommission}>
              Save Commission
            </Button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}