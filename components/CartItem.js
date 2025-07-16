import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <View style={styles.container}>
    {/* Product image */}
    <Image source={{ uri: item.image }} style={styles.image} />
    {/* Product info */}
    <View style={styles.info}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>${item.price}</Text>
      {/* Quantity controls */}
      <View style={styles.qtyRow}>
        <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => onUpdateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
    {/* Remove button */}
    <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
      <Text style={styles.removeText}>Remove</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  price: {
    color: '#007bff',
    marginBottom: 5,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qty: {
    fontSize: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 10,
  },
  removeText: {
    color: 'red',
  },
});

export default CartItem; 