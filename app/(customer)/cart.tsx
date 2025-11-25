import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { supabase, Retailer } from '@/lib/supabase';

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal, clearCart, retailerId } = useCart();
  const [retailer, setRetailer] = useState<Retailer | null>(null);

  useEffect(() => {
    if (retailerId) {
      fetchRetailer();
    }
  }, [retailerId]);

  const fetchRetailer = async () => {
    const { data } = await supabase
      .from('retailers')
      .select('*')
      .eq('id', retailerId)
      .maybeSingle();

    if (data) setRetailer(data as Retailer);
  };

  const subtotal = getTotal();
  const deliveryFee = retailer?.delivery_fee || 5.0;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + deliveryFee + serviceFee;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add items from a shop to get started</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(customer)/(tabs)/')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {retailer && (
          <View style={styles.shopBanner}>
            <Text style={styles.shopBannerText}>
              Ordering from {retailer.business_name}
            </Text>
          </View>
        )}

        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <Image
                source={{
                  uri:
                    item.product.image_url ||
                    'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg',
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemPrice}>
                  ${item.product.price.toFixed(2)}/{item.product.unit}
                </Text>
                <View style={styles.itemFooter}>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Minus size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                    >
                      <Plus size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemTotal}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.product.id)}
              >
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push('/(customer)/checkout')}
        >
          <Text style={styles.checkoutButtonText}>
            Proceed to Checkout - ${total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 50,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  shopBanner: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  shopBannerText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
    textAlign: 'center',
  },
  itemsList: {
    padding: 20,
    gap: 16,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  removeButton: {
    padding: 8,
  },
  summary: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0EA5E9',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  checkoutButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
