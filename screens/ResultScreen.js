import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../hooks/useCart';
import { useDeliveryInfo } from '../context/CartContext';

const getAddressLines = (address) => {
  if (!address) return ['Unknown address'];
  // Try to split by comma for multi-line display
  return address.split(',').map(line => line.trim()).filter(Boolean);
};

const ResultScreen = () => {
  const navigation = useNavigation();
  const { cart, total, clearCart } = useCart();
  const { deliveryInfo } = useDeliveryInfo();


  const addressLines = deliveryInfo?.address;

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.cartTitle}>{item.title}</Text>
      <Text style={styles.cartDetail}>Qty: {item.quantity}</Text>
      <Text style={styles.cartDetail}>${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  const handleGoToProductList = () => {
    clearCart();
    navigation.navigate('ProductList');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.congrats}>🎉 Congratulations on your order!</Text>
      <Text style={styles.title}>Delivery Information</Text>
      {deliveryInfo?.name && (
        <Text style={styles.info}><Text style={styles.infoLabel}>Name:</Text> {deliveryInfo.name}</Text>
      )}
      {deliveryInfo?.phone && (
        <Text style={styles.info}><Text style={styles.infoLabel}>Phone:</Text> {deliveryInfo.phone}</Text>
      )}
      <Text style={styles.subTitle}>Delivery Location</Text>
      <View style={styles.addressBox}>
    <Text style={styles.addressLine}>{addressLines}</Text>
      </View>
      <Text style={styles.cartHeader}>Your Cart</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyCart}>Your cart is empty.</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCartItem}
          contentContainerStyle={{ paddingBottom: 12 }}
        />
      )}
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      <TouchableOpacity style={styles.button} onPress={handleGoToProductList}>
        <Text style={styles.buttonText}>Go to Product List</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 24,
  },
  congrats: {
    fontSize: 22,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#222',
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#007bff',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#222',
    textAlign: 'center',
  },
  addressBox: {
    marginBottom: 18,
    alignItems: 'center',
  },
  addressLine: {
        textAlign: 'center',
        fontSize: 15,
        color: '#007bff',
        marginBottom: 12,
  },
  cartHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    textAlign: 'center',
  },
  emptyCart: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  cartDetail: {
    fontSize: 15,
    color: '#555',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'center',
    marginVertical: 18,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ResultScreen; 