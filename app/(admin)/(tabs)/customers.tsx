import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Users } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminCustomersScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emptyContainer}>
          <Users size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Customer Management</Text>
          <Text style={styles.emptyText}>
            View and manage customers here
          </Text>
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
  },
});
