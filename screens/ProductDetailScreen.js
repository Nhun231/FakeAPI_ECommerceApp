import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../hooks/useCart';

const ProductDetailScreen = () => {
  // Get product from navigation params
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;
  // Use custom cart hook
  const { addToCart, itemCount } = useCart();

  // State for added to cart message
  const [addedMsg, setAddedMsg] = useState(false);

  // Use first image from images array if available, else fallback to thumbnail or image
  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : product.thumbnail || product.image;

  // Move Cart icon with badge to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerCartBtn} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.headerCartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={styles.headerCartBadge}>
              <Text style={styles.headerCartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, itemCount]);

  // Show 'Added to cart!' message for 1.5 seconds
  useEffect(() => {
    if (addedMsg) {
      const timer = setTimeout(() => setAddedMsg(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [addedMsg]);

  const handleAddToCart = () => {
    addToCart(product);
    setAddedMsg(true);
  };

  return (
    <View style={styles.bg}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.containerCard}>
          <View style={styles.card}>
            {/* Main product image */}
            <Image source={{ uri: mainImage }} style={styles.image} resizeMode="contain" />
            {/* Horizontal scroll of all images if available */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {product.images.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={styles.thumb} resizeMode="contain" />
                ))}
              </ScrollView>
            )}
            {/* Product title */}
            <Text style={styles.title}>{product.title}</Text>
            {/* Product description */}
            <Text style={styles.desc}>{product.description}</Text>
            {/* Product price */}
            <Text style={styles.price}>${product.price}</Text>
            {/* Add to cart button */}
            <View style={styles.buttonRow}>
              <Button title="Add to Cart" onPress={handleAddToCart} color="#007bff" />
            </View>
            {/* Added to cart message */}
            {addedMsg && <Text style={styles.addedMsg}>Added to cart!</Text>}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  containerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
    width: '100%',
  },
  image: { width: 220, height: 220, marginBottom: 20 },
  imageRow: { marginBottom: 16, flexDirection: 'row' },
  thumb: { width: 60, height: 60, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: '#222' },
  desc: { fontSize: 16, color: '#555', marginBottom: 16, textAlign: 'center' },
  price: { fontSize: 20, color: '#007bff', marginBottom: 24, fontWeight: 'bold' },
  buttonRow: { width: '100%', marginTop: 8 },
  addedMsg: {
    marginTop: 16,
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  headerCartBtn: {
    marginRight: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerCartIcon: {
    fontSize: 22,
    color: '#007bff',
  },
  headerCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerCartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ProductDetailScreen; 