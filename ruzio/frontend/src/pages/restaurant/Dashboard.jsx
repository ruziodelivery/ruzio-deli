/**
 * RUZIO - Restaurant Dashboard
 */

import { useState, useEffect } from 'react';
import { restaurantAPI } from '../../services/api';
import { Layout, Card, Button, Input, StatCard, Loading, ErrorMessage, Badge, Modal, OrderStatusBadge } from '../../components/ui';
import toast from 'react-hot-toast';

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // For initial fetch only
  const [loading, setLoading] = useState(false); // For tab data loading
  const [error, setError] = useState('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '', description: '', price: '', category: '', isVeg: false
  });
  const [creating, setCreating] = useState(false); // For restaurant creation

  useEffect(() => {
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant) fetchTabData();
  }, [activeTab, restaurant]);

  const fetchRestaurant = async () => {
    try {
      const res = await restaurantAPI.getMyRestaurant();
      setRestaurant(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setRestaurant(null);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch restaurant');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchTabData = async () => {
    if (!restaurant) return;
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await restaurantAPI.getStats();
        setStats(res.data.data);
      } else if (activeTab === 'menu') {
        const res = await restaurantAPI.getMenu(restaurant._id);
        setMenuItems(res.data.data);
      } else if (activeTab === 'orders') {
        const res = await restaurantAPI.getOrders();
        setOrders(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setCreating(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await restaurantAPI.create(data);
      setRestaurant(res.data.data);
      toast.success('Restaurant created! Waiting for admin approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await restaurantAPI.toggleStatus(restaurant._id);
      setRestaurant(res.data.data);
      toast.success(`Restaurant is now ${res.data.data.isOpen ? 'OPEN' : 'CLOSED'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await restaurantAPI.updateMenuItem(editingItem._id, menuForm);
        toast.success('Item updated!');
      } else {
        await restaurantAPI.addMenuItem(restaurant._id, menuForm);
        toast.success('Item added!');
      }
      setShowMenuModal(false);
      setEditingItem(null);
      setMenuForm({ name: '', description: '', price: '', category: '', isVeg: false });
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return;
    try {
      await restaurantAPI.deleteMenuItem(itemId);
      toast.success('Item deleted!');
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await restaurantAPI.toggleItemAvailability(itemId);
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await restaurantAPI.acceptOrder(orderId);
      toast.success('Order accepted!');
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleRejectOrder = async (orderId) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await restaurantAPI.rejectOrder(orderId, reason);
      toast.success('Order rejected');
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await restaurantAPI.updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      fetchTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category || '',
      isVeg: item.isVeg
    });
    setShowMenuModal(true);
  };

  // Show loading during initial fetch
  if (initialLoading) {
    return <Layout><Loading /></Layout>;
  }

  // Show create restaurant form if no restaurant exists
  if (!restaurant) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-10">
          <Card>
            <h2 className="text-xl font-bold mb-4">Create Your Restaurant</h2>
            <form onSubmit={handleCreateRestaurant}>
              <Input label="Restaurant Name" name="name" required />
              <Input label="Description" name="description" />
              <Input label="Cuisine Type" name="cuisine" placeholder="e.g., Italian, Chinese" />
              <Input label="Address" name="address" />
              <Input label="Phone" name="phone" />
              <Button type="submit" disabled={creating} className="w-full mt-4">
                {creating ? 'Creating...' : 'Create Restaurant'}
              </Button>
            </form>
          </Card>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'menu', label: '🍽️ Menu' },
    { id: 'orders', label: '📦 Orders' }
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
          <p className="text-gray-500">{restaurant?.cuisine}</p>
        </div>
        <div className="flex items-center space-x-4">
          {!restaurant?.isApproved && (
            <Badge variant="warning">Pending Approval</Badge>
          )}
          {restaurant?.isApproved && (
            <Button
              variant={restaurant.isOpen ? 'danger' : 'success'}
              onClick={handleToggleStatus}
            >
              {restaurant.isOpen ? '🔴 Close Restaurant' : '🟢 Open Restaurant'}
            </Button>
          )}
        </div>
      </div>

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

      {/* Overview Tab */}
      {!loading && activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" />
          <StatCard title="Pending Orders" value={stats.pendingOrders} icon="⏳" />
          <StatCard title="Total Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} icon="💰" />
          <StatCard title="Commission Paid" value={`$${stats.totalCommissionPaid.toFixed(2)}`} icon="📊" />
        </div>
      )}

      {/* Menu Tab */}
      {!loading && activeTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Menu Items</h2>
            <Button onClick={() => {
              setEditingItem(null);
              setMenuForm({ name: '', description: '', price: '', category: '', isVeg: false });
              setShowMenuModal(true);
            }}>
              + Add Item
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(item => (
              <Card key={item._id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {item.isVeg ? '🟢' : '🔴'} {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <p className="text-lg font-bold text-primary-600 mt-2">${item.price.toFixed(2)}</p>
                  </div>
                  <Badge variant={item.isAvailable ? 'success' : 'danger'}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button variant="secondary" onClick={() => openEditModal(item)}>Edit</Button>
                  <Button variant="secondary" onClick={() => handleToggleAvailability(item._id)}>
                    Toggle
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteItem(item._id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {!loading && activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-gray-500">No orders yet</p>
            </Card>
          ) : (
            orders.map(order => (
              <Card key={order._id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">Customer: {order.customer?.name}</p>
                    <p className="text-sm text-gray-500">Address: {order.deliveryAddress}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {item.quantity}x {item.name} - ${item.subtotal.toFixed(2)}
                    </p>
                  ))}
                  <p className="font-bold mt-2">Total: ${order.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Your Earning: ${order.restaurantEarning.toFixed(2)}</p>
                </div>

                <div className="flex space-x-2 mt-4">
                  {order.status === 'pending' && (
                    <>
                      <Button variant="success" onClick={() => handleAcceptOrder(order._id)}>Accept</Button>
                      <Button variant="danger" onClick={() => handleRejectOrder(order._id)}>Reject</Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <Button onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}>
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button variant="success" onClick={() => handleUpdateOrderStatus(order._id, 'ready')}>
                      Mark Ready
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Menu Item Modal */}
      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
      >
        <form onSubmit={handleAddMenuItem}>
          <Input
            label="Item Name"
            value={menuForm.name}
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={menuForm.description}
            onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={menuForm.price}
            onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
            required
          />
          <Input
            label="Category"
            value={menuForm.category}
            onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
            placeholder="e.g., Pizza, Drinks, Desserts"
          />
          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={menuForm.isVeg}
              onChange={(e) => setMenuForm({ ...menuForm, isVeg: e.target.checked })}
              className="rounded"
            />
            <span>Vegetarian</span>
          </label>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">
              {editingItem ? 'Update' : 'Add'} Item
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowMenuModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
