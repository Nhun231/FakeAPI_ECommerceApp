import React from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useCart } from '../hooks/useCart';
import CartItem from '../components/CartItem';
import PriceSummary from '../components/PriceSummary';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const navigation = useNavigation();
  // Use custom cart hook
  const { cart, updateQuantity, removeFromCart, total, itemCount, clearCart } = useCart();

  // Render each cart item
  const renderItem = ({ item }) => (
    <CartItem
      item={item}
      onUpdateQuantity={updateQuantity}
      onRemove={removeFromCart}
    />
  );

  return (
    <View style={styles.container}>
      {/* Cart item count */}
      <Text style={styles.header}>Cart ({itemCount} items)</Text>
      {/* Clear Cart button */}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
          <Text style={styles.clearBtnText}>Clear Cart</Text>
        </TouchableOpacity>
      )}
      {/* Cart items list */}
      <FlatList
        data={cart}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
      />
      {/* Price summary */}
      <PriceSummary total={total} />
      {/* Continue button */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: '#007bff',
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 16,
          }}
          onPress={() => navigation.navigate('DeliveryLocation')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  clearBtn: { backgroundColor: '#ff3b30', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-end', marginBottom: 10 },
  clearBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default CartScreen; 