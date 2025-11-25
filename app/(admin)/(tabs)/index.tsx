import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Store, Users } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardScreen() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalRetailers: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount');

    const { data: retailersData } = await supabase
      .from('retailers')
      .select('id');

    const { data: customersData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_type', 'customer');

    const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    setStats({
      totalOrders: ordersData?.length || 0,
      totalRevenue,
      totalRetailers: retailersData?.length || 0,
      totalCustomers: customersData?.length || 0,
    });

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {profile?.full_name}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0EA5E9" />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <ShoppingBag size={28} color="#0EA5E9" />
              </View>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <DollarSign size={28} color="#10B981" />
              </View>
              <Text style={styles.statValue}>${stats.totalRevenue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                <Store size={28} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{stats.totalRetailers}</Text>
              <Text style={styles.statLabel}>Retailers</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E0E7FF' }]}>
                <Users size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{stats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
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
  greeting: {
    fontSize: 28,
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
    borderRadius: 16,
    padding: 24,
    width: '47%',
    alignItems: 'center',
  },
  statIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
