import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PriceSummary = ({ total }) => (
  <View style={styles.container}>
    {/* Total price display */}
    <Text style={styles.label}>Total:</Text>
    <Text style={styles.total}>${total.toFixed(2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  total: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default PriceSummary; 