import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/sign-in" />
          <Stack.Screen name="auth/sign-up" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(retailer)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </CartProvider>
    </AuthProvider>
  );
}
