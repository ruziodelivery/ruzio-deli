/**
 * RUZIO - Cart Context
 * Manages shopping cart state for customers
 */

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    restaurantId: null,
    restaurantName: '',
    items: [],
    distanceKm: 2 // Default mock distance
  });

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('ruzio_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('ruzio_cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (item, restaurant) => {
    // If adding from different restaurant, clear cart first
    if (cart.restaurantId && cart.restaurantId !== restaurant._id) {
      if (!window.confirm('Your cart has items from another restaurant. Clear cart and add this item?')) {
        return false;
      }
      setCart({
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        items: [{ ...item, quantity: 1 }],
        distanceKm: cart.distanceKm
      });
      return true;
    }

    setCart(prev => {
      const existingIndex = prev.items.findIndex(i => i._id === item._id);
      
      if (existingIndex >= 0) {
        // Update quantity
        const newItems = [...prev.items];
        newItems[existingIndex].quantity += 1;
        return { ...prev, items: newItems };
      }
      
      // Add new item
      return {
        ...prev,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        items: [...prev.items, { ...item, quantity: 1 }]
      };
    });
    return true;
  };

  const removeItem = (itemId) => {
    setCart(prev => {
      const newItems = prev.items.filter(i => i._id !== itemId);
      if (newItems.length === 0) {
        return { restaurantId: null, restaurantName: '', items: [], distanceKm: prev.distanceKm };
      }
      return { ...prev, items: newItems };
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      )
    }));
  };

  const setDistance = (distanceKm) => {
    setCart(prev => ({ ...prev, distanceKm }));
  };

  const clearCart = () => {
    setCart({ restaurantId: null, restaurantName: '', items: [], distanceKm: 2 });
  };

  const getTotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    setDistance,
    clearCart,
    getTotal,
    getItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
