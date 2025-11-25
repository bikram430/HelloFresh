import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, Truck, CheckCircle, Phone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, Order } from '@/lib/supabase';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const subscription = supabase
      .channel(`order:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, retailers(business_name, phone)')
      .eq('id', id)
      .maybeSingle();

    if (data && !error) {
      setOrder(data);
    }
    setLoading(false);
  };

  const getStatusSteps = () => {
    const steps = [
      { label: 'Confirmed', status: 'confirmed', icon: CheckCircle },
      { label: 'Preparing', status: 'preparing', icon: Package },
      { label: 'Out for Delivery', status: 'out_for_delivery', icon: Truck },
      { label: 'Delivered', status: 'delivered', icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex((s) => s.status === order?.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
          <Text style={styles.shopName}>{order.retailers?.business_name}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.created_at).toLocaleString('en-AU')}
          </Text>
        </View>

        <View style={styles.timeline}>
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <View key={step.status} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View
                    style={[
                      styles.timelineIcon,
                      step.completed && styles.timelineIconCompleted,
                      step.active && styles.timelineIconActive,
                    ]}
                  >
                    <Icon
                      size={20}
                      color={step.completed ? '#fff' : '#9CA3AF'}
                    />
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        step.completed && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      step.completed && styles.timelineLabelCompleted,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {order.status === 'out_for_delivery' && (
          <View style={styles.driverCard}>
            <Text style={styles.driverCardTitle}>Your Driver</Text>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverInitial}>
                  {order.driver_name?.[0] || 'D'}
                </Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>
                  {order.driver_name || 'Driver'}
                </Text>
                <Text style={styles.driverVehicle}>
                  {order.driver_vehicle || 'Vehicle'}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={20} color="#0EA5E9" />
              </TouchableOpacity>
            </View>
            <Text style={styles.eta}>
              Estimated arrival: {order.estimated_delivery_time ? new Date(order.estimated_delivery_time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : '25-35 min'}
            </Text>
          </View>
        )}

        <View style={styles.orderDetails}>
          <Text style={styles.orderDetailsTitle}>Order Details</Text>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Total Amount</Text>
            <Text style={styles.orderDetailValue}>
              ${order.total_amount.toFixed(2)}
            </Text>
          </View>
          {order.special_instructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsLabel}>Special Instructions</Text>
              <Text style={styles.instructionsText}>
                {order.special_instructions}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Need Help?</Text>
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
  orderHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  orderId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  timeline: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#10B981',
  },
  timelineIconActive: {
    backgroundColor: '#0EA5E9',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 40,
  },
  timelineLabel: {
    fontSize: 16,
    color: '#6B7280',
    paddingTop: 10,
  },
  timelineLabelCompleted: {
    color: '#111827',
    fontWeight: '600',
  },
  driverCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
  },
  driverCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  driverVehicle: {
    fontSize: 13,
    color: '#6B7280',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eta: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  orderDetails: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDetailLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  orderDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  instructionsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  instructionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#111827',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  helpButton: {
    borderWidth: 1,
    borderColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#0EA5E9',
    fontSize: 16,
    fontWeight: '600',
  },
});
