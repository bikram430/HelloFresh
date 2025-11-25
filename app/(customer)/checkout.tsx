import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, CreditCard, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotal, retailerId, clearCart } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main St, Sydney NSW 2000');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [driverTip, setDriverTip] = useState(5);
  const [loading, setLoading] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = 5.0;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + deliveryFee + serviceFee + driverTip;

  const handlePlaceOrder = async () => {
    if (!user || !retailerId) return;

    setLoading(true);

    try {
      const addressResult = await supabase
        .from('customer_addresses')
        .select('id')
        .eq('customer_id', user.id)
        .maybeSingle();

      let addressId = addressResult.data?.id;

      if (!addressId) {
        const newAddress = await supabase
          .from('customer_addresses')
          .insert([
            {
              customer_id: user.id,
              address_line1: deliveryAddress,
              suburb: 'Sydney',
              postcode: '2000',
              is_default: true,
            },
          ])
          .select()
          .single();

        addressId = newAddress.data?.id;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: user.id,
            retailer_id: retailerId,
            delivery_address_id: addressId,
            status: 'pending',
            subtotal,
            delivery_fee: deliveryFee,
            service_fee: serviceFee,
            driver_tip: driverTip,
            total_amount: total,
            special_instructions: specialInstructions,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      await supabase.from('order_items').insert(orderItems);

      clearCart();

      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully.',
        [
          {
            text: 'Track Order',
            onPress: () => router.replace(`/(customer)/order-tracking/${orderData.id}`),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <TextInput
            style={styles.addressInput}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Enter delivery address"
            multiline
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <TouchableOpacity style={styles.paymentMethod}>
            <View style={styles.paymentMethodLeft}>
              <View style={styles.cardIcon}>
                <CreditCard size={20} color="#0EA5E9" />
              </View>
              <View>
                <Text style={styles.paymentMethodName}>Credit Card</Text>
                <Text style={styles.paymentMethodDetails}>**** **** **** 4242</Text>
              </View>
            </View>
            <Check size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Tip</Text>
          <View style={styles.tipOptions}>
            {[0, 3, 5, 10].map((tip) => (
              <TouchableOpacity
                key={tip}
                style={[
                  styles.tipButton,
                  driverTip === tip && styles.tipButtonActive,
                ]}
                onPress={() => setDriverTip(tip)}
              >
                <Text
                  style={[
                    styles.tipButtonText,
                    driverTip === tip && styles.tipButtonTextActive,
                  ]}
                >
                  ${tip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <TextInput
            style={styles.instructionsInput}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder="Add delivery instructions..."
            multiline
            numberOfLines={3}
          />
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
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Driver Tip</Text>
            <Text style={styles.summaryValue}>${driverTip.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order - ${total.toFixed(2)}
            </Text>
          )}
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
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  addressInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 60,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  paymentMethodDetails: {
    fontSize: 13,
    color: '#6B7280',
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  tipButtonActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#EFF6FF',
  },
  tipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tipButtonTextActive: {
    color: '#0EA5E9',
  },
  instructionsInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summary: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
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
  placeOrderButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
