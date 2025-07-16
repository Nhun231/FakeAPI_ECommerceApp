import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useWishlist } from '../hooks/useWishlist';

const ProductCard = ({ product, onPress, showWishlistButton = false, onWishlistPress }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isFavorite = wishlist.some(item => item.id === product.id);

  const handleWishlist = () => {
    if (onWishlistPress) return onWishlistPress();
    if (isFavorite) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Product image */}
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      {/* Wishlist heart icon */}
      {showWishlistButton && (
        <TouchableOpacity style={styles.heartBtn} onPress={handleWishlist} activeOpacity={0.7}>
          <Text style={[styles.heartIcon, isFavorite && styles.heartIconFilled]}>{isFavorite ? '❤' : '♡'}</Text>
        </TouchableOpacity>
      )}
      {/* Product title */}
      <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
      {/* Product price */}
      <Text style={styles.price}>${product.price}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ff3b30',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  heartIcon: {
    fontSize: 18,
    color: '#ff3b30',
  },
  heartIconFilled: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  price: {
    fontSize: 15,
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default ProductCard; 