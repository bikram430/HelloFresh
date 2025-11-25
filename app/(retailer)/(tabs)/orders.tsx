import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react-native';

export default function RetailerOrdersScreen() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!profile) return;

    const { data: retailerData } = await supabase
      .from('retailers')
      .select('id')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (retailerData) {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('retailer_id', retailerData.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready_for_pickup'])
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
    }

    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
    } else {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Orders</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active orders</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                  <Text style={styles.orderTime}>
                    {new Date(order.created_at).toLocaleString('en-AU')}
                  </Text>
                </View>

                <Text style={styles.orderAmount}>
                  ${order.total_amount.toFixed(2)}
                </Text>

                <View style={styles.orderActions}>
                  {order.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => updateOrderStatus(order.id, 'confirmed')}
                      >
                        <CheckCircle size={18} color="#fff" />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => updateOrderStatus(order.id, 'cancelled')}
                      >
                        <XCircle size={18} color="#EF4444" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      <Text style={styles.statusButtonText}>Mark as Preparing</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'preparing' && (
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => updateOrderStatus(order.id, 'ready_for_pickup')}
                    >
                      <Text style={styles.statusButtonText}>Mark as Ready</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'ready_for_pickup' && (
                    <View style={styles.readyBadge}>
                      <Text style={styles.readyText}>Ready for Pickup</Text>
                    </View>
                  )}
                </View>
              </View>
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
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  ordersList: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 16,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  readyBadge: {
    flex: 1,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  readyText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '600',
  },
});
