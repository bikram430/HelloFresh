import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, Star, Clock, DollarSign } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, Retailer, Product } from '@/lib/supabase';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setRetailers([]);
      setProducts([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);

    const { data: retailerData } = await supabase
      .from('retailers')
      .select('*')
      .eq('status', 'approved')
      .ilike('business_name', `%${searchQuery}%`)
      .limit(5);

    const { data: productData } = await supabase
      .from('products')
      .select('*, retailers!inner(*)')
      .ilike('name', `%${searchQuery}%`)
      .eq('retailers.status', 'approved')
      .limit(10);

    if (retailerData) setRetailers(retailerData as Retailer[]);
    if (productData) setProducts(productData as any);

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchContainer}>
          <SearchIcon size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for shops or products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
          </View>
        ) : searchQuery.length === 0 ? (
          <View style={styles.emptyContainer}>
            <SearchIcon size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Start Searching</Text>
            <Text style={styles.emptyText}>
              Find local shops and products in your area
            </Text>
          </View>
        ) : (
          <>
            {retailers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shops</Text>
                <View style={styles.resultsList}>
                  {retailers.map((retailer) => (
                    <TouchableOpacity
                      key={retailer.id}
                      style={styles.shopCard}
                      onPress={() => router.push(`/(customer)/shop/${retailer.id}`)}
                    >
                      <Image
                        source={{
                          uri:
                            retailer.photo_url ||
                            'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
                        }}
                        style={styles.shopImage}
                      />
                      <View style={styles.shopInfo}>
                        <Text style={styles.shopName} numberOfLines={1}>
                          {retailer.business_name}
                        </Text>
                        <View style={styles.shopMeta}>
                          <View style={styles.shopMetaItem}>
                            <Star size={14} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.shopMetaText}>
                              {retailer.rating.toFixed(1)}
                            </Text>
                          </View>
                          <View style={styles.shopMetaItem}>
                            <Clock size={14} color="#6B7280" />
                            <Text style={styles.shopMetaText}>25-35 min</Text>
                          </View>
                          <View style={styles.shopMetaItem}>
                            <DollarSign size={14} color="#6B7280" />
                            <Text style={styles.shopMetaText}>
                              ${retailer.delivery_fee.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {products.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Products</Text>
                <View style={styles.productsList}>
                  {products.map((product) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.productCard}
                      onPress={() =>
                        router.push(`/(customer)/shop/${product.retailer_id}`)
                      }
                    >
                      <Image
                        source={{
                          uri:
                            product.image_url ||
                            'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg',
                        }}
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text style={styles.productPrice}>
                          ${product.price.toFixed(2)}/{product.unit}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {retailers.length === 0 && products.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Results Found</Text>
                <Text style={styles.emptyText}>
                  Try searching for something else
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  resultsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  shopInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  shopMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  shopMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  productsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    width: '48%',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
});
