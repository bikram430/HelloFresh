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
import { MapPin, Star, Clock, DollarSign, ShoppingCart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, Retailer } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = [
  { id: 'fruits_veg', label: 'Fruits & Veg', emoji: '🥬' },
  { id: 'bakery', label: 'Bakery', emoji: '🥖' },
  { id: 'butcher', label: 'Butcher', emoji: '🥩' },
  { id: 'deli', label: 'Deli', emoji: '🧀' },
  { id: 'grocery', label: 'Grocery', emoji: '🛒' },
];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { getItemCount } = useCart();
  const { profile } = useAuth();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchRetailers();
  }, [selectedCategory]);

  const fetchRetailers = async () => {
    setLoading(true);
    let query = supabase
      .from('retailers')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;

    if (data && !error) {
      setRetailers(data as Retailer[]);
    }
    setLoading(false);
  };

  const cartItemCount = getItemCount();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.full_name || 'there'}!</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#0EA5E9" />
              <Text style={styles.location}>Sydney, NSW</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/(customer)/cart')}
          >
            <ShoppingCart size={24} color="#0EA5E9" />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for shops or products..."
            placeholderTextColor="#9CA3AF"
            onFocus={() => router.push('/(customer)/(tabs)/search')}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <View style={styles.categories}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.categoryLabelActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? 'Filtered Shops' : 'Featured Shops'}
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0EA5E9" />
            </View>
          ) : retailers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No shops found</Text>
            </View>
          ) : (
            <View style={styles.shopGrid}>
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
                    <Text style={styles.shopSuburb}>{retailer.suburb}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#0EA5E9',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categories: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#EFF6FF',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryLabelActive: {
    color: '#0EA5E9',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  shopGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  shopImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  shopInfo: {
    padding: 16,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  shopMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  shopMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  shopSuburb: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
