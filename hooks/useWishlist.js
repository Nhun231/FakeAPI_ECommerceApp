import { useContext, createContext, useState, useMemo } from 'react';

// Create WishlistContext
const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Add product to wishlist (avoid duplicates)
  const addToWishlist = (product) => {
    setWishlist(prev => prev.find(item => item.id === product.id) ? prev : [...prev, product]);
  };

  // Remove product from wishlist
  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  // Clear the wishlist
  const clearWishlist = () => setWishlist([]);

  // Memoize value
  const value = useMemo(() => ({ wishlist, addToWishlist, removeFromWishlist, clearWishlist }), [wishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

// Custom hook to use wishlist
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}; 