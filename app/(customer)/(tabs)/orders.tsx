import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, Order } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*, retailers(business_name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data as any);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'out_for_delivery':
        return '#0EA5E9';
      default:
        return '#F59E0B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={20} color="#10B981" />;
      case 'cancelled':
        return <XCircle size={20} color="#EF4444" />;
      case 'out_for_delivery':
        return <Package size={20} color="#0EA5E9" />;
      default:
        return <Clock size={20} color="#F59E0B" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>
              Start exploring local shops and place your first order!
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(customer)/(tabs)/')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order: any) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() =>
                  order.status !== 'delivered' && order.status !== 'cancelled'
                    ? router.push(`/(customer)/order-tracking/${order.id}`)
                    : null
                }
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    {getStatusIcon(order.status)}
                    <View style={styles.orderHeaderText}>
                      <Text style={styles.shopName} numberOfLines={1}>
                        {order.retailers?.business_name}
                      </Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(order.status)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Order ID</Text>
                    <Text style={styles.orderDetailValue}>
                      #{order.id.slice(0, 8)}
                    </Text>
                  </View>
                  <View style={styles.orderDetailRow}>
                    <Text style={styles.orderDetailLabel}>Total Amount</Text>
                    <Text style={styles.orderDetailValue}>
                      ${order.total_amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => router.push(`/(customer)/order-tracking/${order.id}`)}
                  >
                    <Text style={styles.trackButtonText}>Track Order</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 80,
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
  ordersList: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  orderHeaderText: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    gap: 8,
    marginBottom: 16,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  trackButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '600',
  },
});
