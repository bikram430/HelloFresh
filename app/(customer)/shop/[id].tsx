import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Clock,
  DollarSign,
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, Retailer, Product } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';

export default function ShopDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { items, addItem, updateQuantity, retailerId, getItemCount } = useCart();
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopData();
  }, [id]);

  const fetchShopData = async () => {
    const { data: retailerData } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('retailer_id', id)
      .eq('stock_status', 'in_stock');

    if (retailerData) setRetailer(retailerData as Retailer);
    if (productsData) setProducts(productsData as Product[]);
    setLoading(false);
  };

  const getProductQuantity = (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = (product: Product) => {
    if (retailerId && retailerId !== id) {
      return;
    }
    addItem(product, id as string);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const cartItemCount = getItemCount();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!retailer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Shop not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/(customer)/cart')}
        >
          <ShoppingCart size={24} color="#111827" />
          {cartItemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{
            uri:
              retailer.photo_url ||
              'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
          }}
          style={styles.coverImage}
        />

        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{retailer.business_name}</Text>
          <Text style={styles.description}>{retailer.description}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Star size={18} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.metaText}>
                {retailer.rating.toFixed(1)} ({retailer.total_reviews})
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={18} color="#6B7280" />
              <Text style={styles.metaText}>25-35 min</Text>
            </View>
            <View style={styles.metaItem}>
              <DollarSign size={18} color="#6B7280" />
              <Text style={styles.metaText}>
                ${retailer.delivery_fee.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.addressText}>
              {retailer.address_line1}, {retailer.suburb} {retailer.postcode}
            </Text>
          </View>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>

          {products.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          ) : (
            <View style={styles.productsList}>
              {products.map((product) => {
                const quantity = getProductQuantity(product.id);
                return (
                  <View key={product.id} style={styles.productCard}>
                    <Image
                      source={{
                        uri:
                          product.image_url ||
                          'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg',
                      }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.productPrice}>
                        ${product.price.toFixed(2)}/{product.unit}
                      </Text>

                      {quantity > 0 ? (
                        <View style={styles.quantityControl}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              handleUpdateQuantity(product.id, quantity - 1)
                            }
                          >
                            <Minus size={16} color="#0EA5E9" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              handleUpdateQuantity(product.id, quantity + 1)
                            }
                          >
                            <Plus size={16} color="#0EA5E9" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAddToCart(product)}
                          disabled={retailerId !== null && retailerId !== id}
                        >
                          <Plus size={16} color="#fff" />
                          <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {cartItemCount > 0 && retailerId === id && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => router.push('/(customer)/cart')}
          >
            <View style={styles.viewCartLeft}>
              <ShoppingCart size={20} color="#fff" />
              <Text style={styles.viewCartText}>
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  shopInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  productsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyProducts: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  productsList: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewCartButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
