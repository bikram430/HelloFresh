import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  user_type: 'customer' | 'retailer' | 'admin';
  full_name: string;
  phone: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type Retailer = {
  id: string;
  profile_id: string;
  business_name: string;
  abn: string;
  category: 'fruits_veg' | 'bakery' | 'butcher' | 'deli' | 'grocery' | 'other';
  address_line1: string;
  address_line2: string;
  suburb: string;
  postcode: string;
  latitude: number;
  longitude: number;
  phone: string;
  photo_url: string;
  description: string;
  opening_hours: Record<string, any>;
  delivery_fee: number;
  delivery_radius_km: number;
  rating: number;
  total_reviews: number;
  status: 'pending' | 'approved' | 'suspended';
  bank_details: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  retailer_id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: 'kg' | 'g' | 'each' | 'bunch' | 'pack';
  image_url: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock';
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  retailer_id: string;
  delivery_address_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  driver_tip: number;
  total_amount: number;
  special_instructions: string;
  payment_method_id: string;
  uber_delivery_id: string;
  driver_name: string;
  driver_phone: string;
  driver_photo_url: string;
  driver_vehicle: string;
  driver_rating: number;
  driver_latitude: number;
  driver_longitude: number;
  estimated_delivery_time: string;
  delivered_at: string;
  created_at: string;
  updated_at: string;
};

export type CustomerAddress = {
  id: string;
  customer_id: string;
  address_line1: string;
  address_line2: string;
  suburb: string;
  postcode: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: string;
};
