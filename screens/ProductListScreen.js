import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, StyleSheet, Platform, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../components/ProductCard'; 
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../hooks/useCart';

const PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 15, 20];
// In-memory cache
const productCache = {};

const getCacheKey = (category, page, pageSize) => `products_${category}_${page}_${pageSize}`;

const ProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false); // For page size dropdown
  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const dropdownRef = useRef();
  // Category filter state
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all');
  const [catDropdownVisible, setCatDropdownVisible] = useState(false);
  const [catDropdownPos, setCatDropdownPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const catDropdownRef = useRef();
  const catScrollRef = useRef(); // Ref for the ScrollView in the category modal
  const navigation = useNavigation();
  const { itemCount } = useCart();
  const fetchingRef = useRef(false); // Prevent overlapping fetches

  // Add both heart and cart icons to header, remove screen title
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.headerHeartBtn} onPress={() => navigation.navigate('Wishlist')}>
            <Text style={styles.headerHeartIcon}>❤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerCartBtn} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.headerCartIcon}>🛒</Text>
            {itemCount > 0 && (
              <View style={styles.headerCartBadge}>
                <Text style={styles.headerCartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, itemCount]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://dummyjson.com/products/categories');
        const data = await res.json();
        setCategories(['all', ...data]);
      } catch (e) {
        setCategories(['all']);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with memory and AsyncStorage cache
  const fetchProducts = async (pageNum = 1, pageSizeVal = pageSize, cat = category) => {
    setLoading(true);
    setError(null);
    const cacheKey = getCacheKey(cat, pageNum, pageSizeVal);
    // 1. Try memory cache
    if (productCache[cacheKey]) {
      setProducts(productCache[cacheKey].products);
      setTotalProducts(productCache[cacheKey].total);
      setLoading(false);
      return;
    }
    // 2. Try AsyncStorage
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setProducts(parsed.products);
        setTotalProducts(parsed.total);
        // Save to memory cache
        productCache[cacheKey] = parsed;
        setLoading(false);
        return;
      }
    } catch (e) {}
    // 3. Fetch from network
    try {
      const skip = (pageNum - 1) * pageSizeVal;
      let url = '';
      if (cat && cat !== 'all') {
        url = `https://dummyjson.com/products/category/${encodeURIComponent(cat)}?limit=${pageSizeVal}&skip=${skip}`;
      } else {
        url = `https://dummyjson.com/products?limit=${pageSizeVal}&skip=${skip}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
        setTotalProducts(data.total);
        // Save to both caches
        productCache[cacheKey] = { products: data.products, total: data.total };
        AsyncStorage.setItem(cacheKey, JSON.stringify({ products: data.products, total: data.total }));
      }
    } catch (e) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // When page, pageSize, or category changes, fetch products for that page
  useEffect(() => {
    fetchProducts(page, pageSize, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, category]);

  useEffect(() => {
    if (search.trim() === '') setFiltered(products);
    else setFiltered(products.filter(p => p.title.toLowerCase().includes(search.toLowerCase())));
  }, [search, products]);

  const renderItem = ({ item }) => {
    const imageUrl = Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : item.thumbnail || item.image;
    return (
      <ProductCard
        product={{ ...item, image: imageUrl }}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        showWishlistButton={true}
      />
    );
  };

  const totalPages = Math.ceil(totalProducts / pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Handle dropdown selection
  const handleSelectPageSize = (size) => {
    setPageSize(size);
    setPage(1);
    setDropdownVisible(false);
  };

  // Show dropdown below the picker
  const showDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPos({ x, y, width, height });
        setDropdownVisible(true);
      });
    }
  };

  // Handle category dropdown selection
  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setPage(1);
    setCatDropdownVisible(false);
  };

  // Show category dropdown below the button
  const showCatDropdown = () => {
    if (catDropdownRef.current) {
      catDropdownRef.current.measureInWindow((x, y, width, height) => {
        setCatDropdownPos({ x, y, width, height });
        setCatDropdownVisible(true);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Category Filter Dropdown */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Category:</Text>
        <TouchableOpacity
          ref={catDropdownRef}
          style={styles.categoryDropdown}
          onPress={showCatDropdown}
          activeOpacity={0.7}
        >
          <Text style={styles.categoryDropdownText}>{category === 'all' ? 'All' : category}</Text>
          <Text style={styles.categoryDropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>
      {/* Category Modal Dropdown */}
      <Modal
        visible={catDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCatDropdownVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCatDropdownVisible(false)}>
          <View style={[styles.categoryModalDropdown, {
            position: 'absolute',
            top: catDropdownPos.y + catDropdownPos.height,
            left: catDropdownPos.x,
            width: catDropdownPos.width || 200,
            maxWidth: Dimensions.get('window').width - catDropdownPos.x - 16,
            maxHeight: 300, // Limit dropdown height
          }]}
          >
            {/* Scrollable list of categories, auto-scroll to selected */}
            <ScrollView ref={catScrollRef}>
              {categories.map(cat => {
                // Support both string and object category formats
                const value = typeof cat === 'string' ? cat : (cat.slug || cat.name || JSON.stringify(cat));
                const label = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Unknown');
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.modalOption, value === category && styles.modalOptionSelected]}
                    onPress={() => handleSelectCategory(value)}
                  >
                    <Text style={[styles.modalOptionText, value === category && styles.modalOptionTextSelected]}>
                      {value === 'all' ? 'All' : label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
      {/* Search and Page Size Dropdown Card */}
      <View style={styles.topCard}>
        <TextInput
          style={styles.search}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Products per page:</Text>
          <TouchableOpacity
            ref={dropdownRef}
            style={styles.dropdown}
            onPress={showDropdown}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{pageSize}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Page Size Modal Dropdown */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
          <View style={[styles.modalDropdown, {
            position: 'absolute',
            top: dropdownPos.y + dropdownPos.height,
            left: dropdownPos.x,
            width: dropdownPos.width || 120,
            maxWidth: Dimensions.get('window').width - dropdownPos.x - 16,
          }]}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.modalOption, size === pageSize && styles.modalOptionSelected]}
                onPress={() => {
                  setPageSize(size);
                  setPage(1);
                  setDropdownVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, size === pageSize && styles.modalOptionTextSelected]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
      {/* Product List in a white card container */}
      <View style={styles.listCard}>
        {/* Error state */}
        {error && <Text style={styles.error}>{error}</Text>}
        {/* Loading state */}
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            numColumns={1}
            key={1}
            ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>}
            contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 4 }}
          />
        )}
      </View>
      {/* Pagination controls */}
      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[styles.pageBtn, !canPrev && styles.pageBtnDisabled]}
          onPress={() => canPrev && setPage(page - 1)}
          disabled={!canPrev}
        >
          <Text style={styles.pageBtnText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>Page {page} of {totalPages}</Text>
        <TouchableOpacity
          style={[styles.pageBtn, !canNext && styles.pageBtnDisabled]}
          onPress={() => canNext && setPage(page + 1)}
          disabled={!canNext}
        >
          <Text style={styles.pageBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 0,
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    fontWeight: '500',
  },
  topCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  search: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    color: '#222',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    marginLeft: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#222',
    marginRight: 8,
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
    minWidth: 120,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#e6f0ff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#222',
  },
  modalOptionTextSelected: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  loader: { marginTop: 20 },
  error: { color: 'red', textAlign: 'center', marginVertical: 10 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  pageBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  pageBtnDisabled: { backgroundColor: '#ccc' },
  pageBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pageInfo: { fontSize: 16, fontWeight: 'bold', color: '#222' },
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
  // Category dropdown styles
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 120,
    marginLeft: 8,
  },
  categoryDropdownText: {
    fontSize: 16,
    color: '#222',
    marginRight: 8,
  },
  categoryDropdownIcon: {
    fontSize: 14,
    color: '#888',
  },
  categoryModalDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 0,
    minWidth: 200,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
  },
  headerHeartBtn: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerHeartIcon: {
    fontSize: 22,
    color: '#ff3b30',
  },
  row: {
    justifyContent: 'space-around',
    marginBottom: 10,
  },
});

export default ProductListScreen; 