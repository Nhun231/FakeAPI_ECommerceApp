import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Render each favorite product
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        showWishlistButton={true}
        onWishlistPress={() => removeFromWishlist(item.id)}
      />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => addToCart(item)}>
          <Text style={styles.actionBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Wishlist</Text>
      {/* Clear Wishlist button */}
      {wishlist.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearWishlist}>
          <Text style={styles.clearBtnText}>Clear Wishlist</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={wishlist}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No favorite items yet.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  itemRow: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionBtn: { backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8 },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  clearBtn: { backgroundColor: '#ff3b30', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-end', marginBottom: 10 },
  clearBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default WishlistScreen; 