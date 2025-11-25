import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (profile) {
          if (profile.user_type === 'customer') {
            router.replace('/(customer)/(tabs)');
          } else if (profile.user_type === 'retailer') {
            router.replace('/(retailer)/(tabs)');
          } else if (profile.user_type === 'admin') {
            router.replace('/(admin)/(tabs)');
          }
        } else {
          setTimeout(() => {
            if (profile) {
              if (profile.user_type === 'customer') {
                router.replace('/(customer)/(tabs)');
              } else if (profile.user_type === 'retailer') {
                router.replace('/(retailer)/(tabs)');
              } else if (profile.user_type === 'admin') {
                router.replace('/(admin)/(tabs)');
              }
            }
          }, 500);
        }
      } else {
        router.replace('/auth/sign-in');
      }
    }
  }, [user, profile, loading]);

  return (
    <LinearGradient
      colors={['#0EA5E9', '#06B6D4']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>Local Fresh</Text>
        <Text style={styles.tagline}>Sydney's Local Grocery Marketplace</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
