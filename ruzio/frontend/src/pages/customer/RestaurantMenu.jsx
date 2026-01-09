/**
 * RUZIO - Restaurant Menu Page (Customer View)
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Layout, Card, Button, Loading, ErrorMessage, Badge, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem, cart, getItemCount } = useCart();

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [id]);

  const fetchRestaurantAndMenu = async () => {
    setLoading(true);
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        restaurantAPI.getById(id),
        restaurantAPI.getMenu(id)
      ]);
      setRestaurant(restaurantRes.data.data);
      setMenuItems(menuRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    if (!restaurant.isOpen) {
      toast.error('Restaurant is currently closed');
      return;
    }
    const added = addItem(item, restaurant);
    if (added) {
      toast.success(`${item.name} added to cart!`);
    }
  };

  const getCartQuantity = (itemId) => {
    const cartItem = cart.items.find(i => i._id === itemId);
    return cartItem?.quantity || 0;
  };

  // Group items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} /></Layout>;
  if (!restaurant) return <Layout><ErrorMessage message="Restaurant not found" /></Layout>;

  return (
    <Layout>
      {/* Restaurant Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <Link to="/browse" className="text-primary-600 text-sm hover:underline mb-2 block">
              ← Back to Restaurants
            </Link>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-primary-600 font-medium">{restaurant.cuisine}</p>
            <p className="text-gray-600 mt-2">{restaurant.description}</p>
            <div className="flex space-x-4 mt-4 text-sm text-gray-500">
              <span>📍 {restaurant.address || 'Address not specified'}</span>
              <span>📞 {restaurant.phone || 'N/A'}</span>
              <span>⭐ {restaurant.rating?.toFixed(1) || '4.0'}</span>
              <span>🕐 ~{restaurant.avgPrepTime} min</span>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={restaurant.isOpen ? 'success' : 'danger'} className="text-lg">
              {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      {getItemCount() > 0 && cart.restaurantId === id && (
        <Card className="mb-6 bg-primary-50 border-2 border-primary-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{getItemCount()} item(s) in cart</p>
              <p className="text-sm text-gray-600">Total: ${cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</p>
            </div>
            <Link to="/cart">
              <Button>View Cart →</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Menu Items */}
      {menuItems.length === 0 ? (
        <EmptyState message="No menu items available" icon="🍽️" />
      ) : (
        Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">{category}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {items.map(item => (
                <Card key={item._id} className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{item.isVeg ? '🟢' : '🔴'}</span>
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <p className="text-lg font-bold text-primary-600 mt-2">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between ml-4">
                    {!item.isAvailable ? (
                      <Badge variant="danger">Unavailable</Badge>
                    ) : (
                      <>
                        {getCartQuantity(item._id) > 0 && (
                          <Badge variant="primary">
                            {getCartQuantity(item._id)} in cart
                          </Badge>
                        )}
                        <Button 
                          onClick={() => handleAddToCart(item)}
                          disabled={!restaurant.isOpen}
                          className="mt-2"
                        >
                          + Add
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </Layout>
  );
}
