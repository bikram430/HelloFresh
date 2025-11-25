import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="shop/[id]" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-tracking/[id]" />
    </Stack>
  );
}
