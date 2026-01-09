/**
 * RUZIO - Customer Home Page
 * Featured restaurants and popular food items
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../../services/api';
import { Layout, Card, Button, Loading, ErrorMessage, Badge } from '../../components/ui';

export default function CustomerHome() {
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Get open restaurants
      const restaurantsRes = await restaurantAPI.getOpen();
      const restaurants = restaurantsRes.data.data || [];
      
      // If no open restaurants, get all restaurants
      if (restaurants.length === 0) {
        const allRestaurantsRes = await restaurantAPI.getAll();
        setFeaturedRestaurants(allRestaurantsRes.data.data.slice(0, 6));
      } else {
        setFeaturedRestaurants(restaurants.slice(0, 6));
      }
      
      // Get menu items from first few restaurants
      if (restaurants.length > 0) {
        const menuPromises = restaurants.slice(0, 3).map(restaurant => 
          restaurantAPI.getMenu(restaurant._id)
        );
        
        try {
          const menuResults = await Promise.allSettled(menuPromises);
          const allItems = [];
          
          menuResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.data.data) {
              const items = result.value.data.data.slice(0, 4).map(item => ({
                ...item,
                restaurant: restaurants[index]
              }));
              allItems.push(...items);
            }
          });
          
          setPopularItems(allItems.slice(0, 8));
        } catch (menuError) {
          console.log('Error fetching menu items:', menuError);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">🍽️ Welcome to RUZIO</h1>
        <p className="text-lg opacity-90 mb-4">
          Discover amazing food from local restaurants
        </p>
        <Link to="/browse">
          <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-50">
            Browse All Restaurants →
          </Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Featured Restaurants */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🏪 Featured Restaurants</h2>
          <Link to="/browse" className="text-primary-600 hover:underline">
            View All →
          </Link>
        </div>
        
        {featuredRestaurants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No restaurants available at the moment</p>
            <p className="text-sm mt-2">Check back later for amazing food options!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map(restaurant => (
              <Link 
                key={restaurant._id} 
                to={`/restaurant/${restaurant._id}`}
                className={`block transition-transform hover:scale-105 ${
                  !restaurant.isOpen ? 'opacity-60' : ''
                }`}
              >
                <Card className="hover:shadow-lg h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                    <Badge variant={restaurant.isOpen ? 'success' : 'danger'}>
                      {restaurant.isOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  
                  <p className="text-primary-600 font-medium text-sm mb-2">
                    {restaurant.cuisine || 'Various'}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {restaurant.description || 'Delicious food awaits!'}
                  </p>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>⭐ {restaurant.rating?.toFixed(1) || '4.0'}</span>
                    <span>🕐 ~{restaurant.avgPrepTime || 30} min</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popular Food Items */}
      {popularItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">🔥 Popular Items</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularItems.map(item => (
              <Link 
                key={`${item.restaurant._id}-${item._id}`}
                to={`/restaurant/${item.restaurant._id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <Badge variant={item.isVeg ? 'success' : 'danger'} className="text-xs">
                      {item.isVeg ? '🌱' : '🍖'}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    from {item.restaurant.name}
                  </p>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary-600">${item.price}</span>
                    <span className="text-xs text-gray-500">
                      {item.category || 'Food'}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-gray-50">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <Link to="/browse" className="p-4 hover:bg-white rounded transition">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold mb-1">Browse Restaurants</h3>
            <p className="text-sm text-gray-600">Find your favorite food</p>
          </Link>
          
          <Link to="/orders" className="p-4 hover:bg-white rounded transition">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-semibold mb-1">My Orders</h3>
            <p className="text-sm text-gray-600">Track your deliveries</p>
          </Link>
          
          <Link to="/cart" className="p-4 hover:bg-white rounded transition">
            <div className="text-2xl mb-2">🛒</div>
            <h3 className="font-semibold mb-1">Cart</h3>
            <p className="text-sm text-gray-600">Review your order</p>
          </Link>
        </div>
      </Card>
    </Layout>
  );
}