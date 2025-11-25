import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Store, Settings, LogOut, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function RetailerProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={40} color="#fff" />
          </View>
          <Text style={styles.name}>{profile?.full_name || 'Retailer'}</Text>
          <Text style={styles.userType}>Retailer Account</Text>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Store size={22} color="#0EA5E9" />
              <Text style={styles.menuItemLabel}>Shop Details</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Settings size={22} color="#0EA5E9" />
              <Text style={styles.menuItemLabel}>Settings</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: '#6B7280',
  },
  menu: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#111827',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
