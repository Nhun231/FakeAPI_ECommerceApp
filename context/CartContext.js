import React, { createContext, useState, useMemo, useContext } from 'react';

// Create CartContext
export const CartContext = createContext();

// CartProvider component to wrap app
export const CartProvider = ({ children }) => {
  // Cart state: array of {id, title, price, image, quantity}
  const [cart, setCart] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    // Always set image property for cart display
    const image =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : product.thumbnail || product.image;

    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        // If already in cart, increase quantity
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with image property
        return [...prev, { ...product, image, quantity: 1 }];
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Update quantity of a product
  const updateQuantity = (id, quantity) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  // Clear the cart
  const clearCart = () => setCart([]);

  // Calculate total price
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  // Calculate total item count
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Context value
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    total,
    itemCount,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Delivery Info Context
export const DeliveryInfoContext = createContext();

export const DeliveryInfoProvider = ({ children }) => {
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: '',
    coordinates: null,
  });

  const updateDeliveryInfo = (info) => {
    setDeliveryInfo(prev => ({ ...prev, ...info }));
  };

  const clearDeliveryInfo = () => setDeliveryInfo({ name: '', phone: '', address: '', coordinates: null });

  const value = useMemo(() => ({
    deliveryInfo,
    updateDeliveryInfo,
    clearDeliveryInfo,
  }), [deliveryInfo]);

  return (
    <DeliveryInfoContext.Provider value={value}>
      {children}
    </DeliveryInfoContext.Provider>
  );
};

export const useDeliveryInfo = () => {
  const context = useContext(DeliveryInfoContext);
  if (!context) throw new Error('useDeliveryInfo must be used within a DeliveryInfoProvider');
  return context;
}; 