import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Star, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function RetailerDashboardScreen() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    rating: 0,
    totalReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!profile) return;

    const { data: retailerData } = await supabase
      .from('retailers')
      .select('id, rating, total_reviews')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (retailerData) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('retailer_id', retailerData.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      const todayRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        todayOrders: ordersData?.length || 0,
        todayRevenue,
        rating: retailerData.rating,
        totalReviews: retailerData.total_reviews,
      });

      setRecentOrders(ordersData?.slice(0, 5) || []);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.full_name}!</Text>
          <Text style={styles.subtitle}>Retailer Dashboard</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <ShoppingBag size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.statValue}>{stats.todayOrders}</Text>
                <Text style={styles.statLabel}>Today's Orders</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <DollarSign size={24} color="#10B981" />
                </View>
                <Text style={styles.statValue}>${stats.todayRevenue.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Today's Revenue</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Star size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <TrendingUp size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.statValue}>{stats.totalReviews}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              {recentOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No orders yet today</Text>
                </View>
              ) : (
                <View style={styles.ordersList}>
                  {recentOrders.map((order) => (
                    <View key={order.id} style={styles.orderCard}>
                      <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(order.status) },
                          ]}
                        >
                          <Text style={styles.statusText}>
                            {order.status.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.orderAmount}>
                        ${order.total_amount.toFixed(2)}
                      </Text>
                      <Text style={styles.orderTime}>
                        {new Date(order.created_at).toLocaleTimeString('en-AU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#FEF3C7';
    case 'confirmed':
      return '#DBEAFE';
    case 'preparing':
      return '#E0E7FF';
    case 'ready_for_pickup':
      return '#D1FAE5';
    default:
      return '#F3F4F6';
  }
};

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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 13,
    color: '#6B7280',
  },
});
