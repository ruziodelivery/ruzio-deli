/**
 * RUZIO - Customer Browse Restaurants & Food Page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Layout, Card, Loading, ErrorMessage, Badge, EmptyState, Button, Input } from '../../components/ui';
import toast from 'react-hot-toast';

export default function BrowseRestaurants() {
  const [activeTab, setActiveTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    fetchData();
  }, [showAll]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch restaurants
      const res = showAll 
        ? await restaurantAPI.getAll()
        : await restaurantAPI.getOpen();
      const restaurantData = res.data.data;
      setRestaurants(restaurantData);

      // Fetch menu items from all restaurants
      if (restaurantData.length > 0) {
        const menuPromises = restaurantData.map(restaurant => 
          restaurantAPI.getMenu(restaurant._id).catch(err => {
            console.log(`Failed to fetch menu for ${restaurant.name}:`, err);
            return { data: { data: [] } };
          })
        );
        
        const menuResults = await Promise.all(menuPromises);
        const allItems = [];
        
        menuResults.forEach((result, index) => {
          if (result.data.data) {
            const items = result.data.data.map(item => ({
              ...item,
              restaurant: restaurantData[index]
            }));
            allItems.push(...items);
          }
        });
        
        setFoodItems(allItems);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    if (!item.restaurant.isOpen) {
      toast.error('Restaurant is currently closed');
      return;
    }
    const added = addItem(item, item.restaurant);
    if (added) {
      toast.success(`${item.name} added to cart!`);
    }
  };

  // Filter data based on search term
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">🍽️ Browse Food</h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search restaurants, food items, cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'restaurants'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏪 Restaurants ({filteredRestaurants.length})
            </button>
            <button
              onClick={() => setActiveTab('food')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'food'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🍕 Food Items ({filteredFoodItems.length})
            </button>
          </div>

          {/* Show All Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show closed restaurants</span>
          </label>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <Loading />}

      {/* Restaurants Tab */}
      {!loading && activeTab === 'restaurants' && (
        <>
          {filteredRestaurants.length === 0 && (
            <EmptyState 
              message={searchTerm ? `No restaurants found for "${searchTerm}"` : "No restaurants available"} 
              icon="🏪" 
            />
          )}

          {filteredRestaurants.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map(restaurant => (
                <Link 
                  key={restaurant._id} 
                  to={`/restaurant/${restaurant._id}`}
                  className={`block ${!restaurant.isOpen ? 'opacity-60' : ''}`}
                >
                  <Card className="hover:shadow-lg transition h-full">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                      <Badge variant={restaurant.isOpen ? 'success' : 'danger'}>
                        {restaurant.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-primary-600 font-medium mt-1">
                      {restaurant.cuisine || 'Various'}
                    </p>
                    
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {restaurant.description || 'Delicious food awaits!'}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
                      <span>⭐ {restaurant.rating?.toFixed(1) || '4.0'}</span>
                      <span>🕐 ~{restaurant.avgPrepTime || 30} min</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Food Items Tab */}
      {!loading && activeTab === 'food' && (
        <>
          {filteredFoodItems.length === 0 && (
            <EmptyState 
              message={searchTerm ? `No food items found for "${searchTerm}"` : "No food items available"} 
              icon="🍕" 
            />
          )}

          {filteredFoodItems.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFoodItems.map(item => (
                <Card key={`${item.restaurant._id}-${item._id}`} className="hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="flex space-x-1">
                      <Badge variant={item.isVeg ? 'success' : 'danger'} className="text-xs">
                        {item.isVeg ? '🌱' : '🍖'}
                      </Badge>
                      {!item.isAvailable && (
                        <Badge variant="danger" className="text-xs">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/restaurant/${item.restaurant._id}`}
                    className="text-xs text-primary-600 hover:underline mb-2 block"
                  >
                    from {item.restaurant.name}
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-primary-600">
                      ${item.price}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.category || 'Food'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        item.restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {item.restaurant.isOpen ? 'Open' : 'Closed'}
                    </div>
                    
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable || !item.restaurant.isOpen}
                      className="text-xs py-1 px-2"
                    >
                      {!item.restaurant.isOpen ? 'Closed' : 
                       !item.isAvailable ? 'Unavailable' : 'Add to Cart'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
 

