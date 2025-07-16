import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Import screens (to be created)
import ProductListScreen from './screens/ProductListScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
// Import CartContext provider (to be created)
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './hooks/useWishlist';
import WishlistScreen from './screens/WishlistScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    // Wrap the app with WishlistProvider for global wishlist state
    <WishlistProvider>
      <CartProvider>
        {/* NavigationContainer manages navigation tree */}
        <NavigationContainer>
          <Stack.Navigator initialRouteName="ProductList">
            {/* Product List Screen */}
            <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
            {/* Product Detail Screen */}
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
            {/* Cart Screen */}
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
            <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Wishlist' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </WishlistProvider>
  );
}
