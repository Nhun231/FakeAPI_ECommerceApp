import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { useCart } from '../hooks/useCart'; // To be created
import CartItem from '../components/CartItem'; // To be created
import PriceSummary from '../components/PriceSummary'; // To be created

const CartScreen = () => {
  // Use custom cart hook
  const { cart, updateQuantity, removeFromCart, total, itemCount } = useCart();

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
      {/* Cart items list */}
      <FlatList
        data={cart}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
      />
      {/* Price summary */}
      <PriceSummary total={total} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
});

export default CartScreen; 