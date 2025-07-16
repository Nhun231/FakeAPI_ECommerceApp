import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, FlatList, ActivityIndicator, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDeliveryInfo } from '../context/CartContext';

const HANOI_REGION = {
  latitude: 21.0285, // Default: Hanoi
  longitude: 105.8542,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const DeliveryLocationScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [region, setRegion] = useState(HANOI_REGION);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [locating, setLocating] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const searchTimeout = useRef(null);
  const { updateDeliveryInfo, deliveryInfo } = useDeliveryInfo();

  useEffect(() => {
    (async () => {
      setLocating(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocating(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const userRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(userRegion);
        setSelectedLocation({ latitude, longitude });
        if (mapRef.current) {
          mapRef.current.animateToRegion(userRegion, 1000);
        }
      } catch (e) {
        // fallback to Hanoi
      } finally {
        setLocating(false);
      }
    })();
    // Prefill name/phone from context
    if (deliveryInfo?.name) setName(deliveryInfo.name);
    if (deliveryInfo?.phone) setPhone(deliveryInfo.phone);
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!selectedLocation) return;
      setAddressLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}&format=json`
        );
        const data = await res.json();
        setAddress(data.display_name || '');
      } catch {
        setAddress('');
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddress();
  }, [selectedLocation]);

  const handleMapPress = (e) => {
    setSelectedLocation(e.nativeEvent.coordinate);
    setRegion({
      ...region,
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
    setShowResults(false);
    Keyboard.dismiss();
  };

  const handleConfirm = () => {
    if (!name.trim() || !phone.trim() || !selectedLocation || !address) {
      Alert.alert('Please enter all delivery information and select a location on the map.');
      return;
    }
    updateDeliveryInfo({
      name: name.trim(),
      phone: phone.trim(),
      address,
      coordinates: selectedLocation,
    });
    navigation.navigate('Result', { location: selectedLocation });
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    setShowResults(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchTimeout.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 400);
  };

  const handleResultPress = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const newRegion = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setSelectedLocation({ latitude: lat, longitude: lon });
    setRegion(newRegion);
    setSearch(item.display_name);
    setShowResults(false);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Delivery Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        returnKeyType="next"
      />
      <Text style={styles.instructions}>Search or tap on the map to choose your delivery location.</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a place (OpenStreetMap)"
            value={search}
            onChangeText={handleSearchChange}
            onFocus={() => setShowResults(true)}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {showResults && search.length >= 3 && (
            <View style={styles.resultsDropdown}>
              {loading ? (
                <ActivityIndicator size="small" style={{ margin: 8 }} />
              ) : results.length === 0 ? (
                <Text style={styles.noResults}>No results</Text>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={item => item.place_id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.resultItem} onPress={() => handleResultPress(item)}>
                      <Text style={styles.resultText}>{item.display_name}</Text>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          )}
        </View>
        {locating ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 12, color: '#888' }}>Getting your location...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            region={region}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation} />
            )}
          </MapView>
        )}
      </View>
      {addressLoading ? (
        <ActivityIndicator size="small" style={{ marginVertical: 8 }} />
      ) : selectedLocation && address ? (
        <Text style={styles.coords}>{address}</Text>
      ) : null}
      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  instructions: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  resultsDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
    maxHeight: 180,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 15,
    color: '#222',
  },
  noResults: {
    padding: 12,
    color: '#888',
    textAlign: 'center',
  },
  map: {
    flex: 1,
    borderRadius: 12,
    marginTop: 56, // leave space for search bar
    minHeight: 320,
  },
  coords: {
    textAlign: 'center',
    fontSize: 15,
    color: '#007bff',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default DeliveryLocationScreen; 