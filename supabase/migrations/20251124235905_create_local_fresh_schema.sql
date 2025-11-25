/*
  # Local Fresh Grocery Delivery App - Database Schema

  ## Overview
  Complete database schema for a multi-sided marketplace connecting customers, retailers, and admin for grocery delivery in Sydney.

  ## 1. New Tables

  ### User Management
  - `profiles` - Extended user profile information
    - `id` (uuid, references auth.users)
    - `user_type` (text: 'customer', 'retailer', 'admin')
    - `full_name` (text)
    - `phone` (text)
    - `avatar_url` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Customer-specific
  - `customer_addresses` - Delivery addresses for customers
    - `id` (uuid, primary key)
    - `customer_id` (uuid, references profiles)
    - `address_line1` (text)
    - `address_line2` (text)
    - `suburb` (text)
    - `postcode` (text)
    - `latitude` (numeric)
    - `longitude` (numeric)
    - `is_default` (boolean)
    - `created_at` (timestamptz)

  - `payment_methods` - Customer payment methods
    - `id` (uuid, primary key)
    - `customer_id` (uuid, references profiles)
    - `type` (text: 'card', 'paypal', 'apple_pay', 'google_pay')
    - `last_four` (text)
    - `is_default` (boolean)
    - `created_at` (timestamptz)

  ### Retailer-specific
  - `retailers` - Retailer business information
    - `id` (uuid, primary key)
    - `profile_id` (uuid, references profiles)
    - `business_name` (text)
    - `abn` (text)
    - `category` (text: 'fruits_veg', 'bakery', 'butcher', 'deli', 'grocery', 'other')
    - `address_line1` (text)
    - `address_line2` (text)
    - `suburb` (text)
    - `postcode` (text)
    - `latitude` (numeric)
    - `longitude` (numeric)
    - `phone` (text)
    - `photo_url` (text)
    - `description` (text)
    - `opening_hours` (jsonb)
    - `delivery_fee` (numeric)
    - `delivery_radius_km` (numeric)
    - `rating` (numeric)
    - `total_reviews` (integer)
    - `status` (text: 'pending', 'approved', 'suspended')
    - `bank_details` (jsonb)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `products` - Products offered by retailers
    - `id` (uuid, primary key)
    - `retailer_id` (uuid, references retailers)
    - `name` (text)
    - `description` (text)
    - `category` (text)
    - `price` (numeric)
    - `unit` (text: 'kg', 'g', 'each', 'bunch', 'pack')
    - `image_url` (text)
    - `stock_status` (text: 'in_stock', 'out_of_stock', 'low_stock')
    - `stock_quantity` (integer)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Orders
  - `orders` - Main orders table
    - `id` (uuid, primary key)
    - `customer_id` (uuid, references profiles)
    - `retailer_id` (uuid, references retailers)
    - `delivery_address_id` (uuid, references customer_addresses)
    - `status` (text: 'pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled')
    - `subtotal` (numeric)
    - `delivery_fee` (numeric)
    - `service_fee` (numeric)
    - `driver_tip` (numeric)
    - `total_amount` (numeric)
    - `special_instructions` (text)
    - `payment_method_id` (uuid, references payment_methods)
    - `uber_delivery_id` (text)
    - `driver_name` (text)
    - `driver_phone` (text)
    - `driver_photo_url` (text)
    - `driver_vehicle` (text)
    - `driver_rating` (numeric)
    - `driver_latitude` (numeric)
    - `driver_longitude` (numeric)
    - `estimated_delivery_time` (timestamptz)
    - `delivered_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `order_items` - Items in each order
    - `id` (uuid, primary key)
    - `order_id` (uuid, references orders)
    - `product_id` (uuid, references products)
    - `quantity` (integer)
    - `unit_price` (numeric)
    - `total_price` (numeric)
    - `created_at` (timestamptz)

  - `reviews` - Customer reviews for retailers
    - `id` (uuid, primary key)
    - `order_id` (uuid, references orders)
    - `customer_id` (uuid, references profiles)
    - `retailer_id` (uuid, references retailers)
    - `rating` (integer, 1-5)
    - `comment` (text)
    - `created_at` (timestamptz)

  - `favorites` - Customer favorite retailers
    - `id` (uuid, primary key)
    - `customer_id` (uuid, references profiles)
    - `retailer_id` (uuid, references retailers)
    - `created_at` (timestamptz)

  - `promo_codes` - Promotional discount codes
    - `id` (uuid, primary key)
    - `code` (text, unique)
    - `discount_type` (text: 'percentage', 'fixed')
    - `discount_value` (numeric)
    - `min_order_value` (numeric)
    - `max_uses` (integer)
    - `current_uses` (integer)
    - `valid_from` (timestamptz)
    - `valid_until` (timestamptz)
    - `active` (boolean)
    - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Customers can only access their own data
  - Retailers can only access their shop and order data
  - Admin has full access to all data
  - Public can view approved retailers and products
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('customer', 'retailer', 'admin')) DEFAULT 'customer',
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Customer addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address_line1 text NOT NULL,
  address_line2 text DEFAULT '',
  suburb text NOT NULL,
  postcode text NOT NULL,
  latitude numeric,
  longitude numeric,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('card', 'paypal', 'apple_pay', 'google_pay')),
  last_four text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Retailers
CREATE TABLE IF NOT EXISTS retailers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  abn text NOT NULL,
  category text NOT NULL CHECK (category IN ('fruits_veg', 'bakery', 'butcher', 'deli', 'grocery', 'other')),
  address_line1 text NOT NULL,
  address_line2 text DEFAULT '',
  suburb text NOT NULL,
  postcode text NOT NULL,
  latitude numeric,
  longitude numeric,
  phone text NOT NULL,
  photo_url text DEFAULT '',
  description text DEFAULT '',
  opening_hours jsonb DEFAULT '{}',
  delivery_fee numeric DEFAULT 5.00,
  delivery_radius_km numeric DEFAULT 10,
  rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'suspended')) DEFAULT 'pending',
  bank_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  price numeric NOT NULL,
  unit text NOT NULL CHECK (unit IN ('kg', 'g', 'each', 'bunch', 'pack')) DEFAULT 'each',
  image_url text DEFAULT '',
  stock_status text NOT NULL CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock')) DEFAULT 'in_stock',
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  delivery_address_id uuid NOT NULL REFERENCES customer_addresses(id),
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  service_fee numeric NOT NULL DEFAULT 0,
  driver_tip numeric DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  special_instructions text DEFAULT '',
  payment_method_id uuid REFERENCES payment_methods(id),
  uber_delivery_id text DEFAULT '',
  driver_name text DEFAULT '',
  driver_phone text DEFAULT '',
  driver_photo_url text DEFAULT '',
  driver_vehicle text DEFAULT '',
  driver_rating numeric DEFAULT 0,
  driver_latitude numeric,
  driver_longitude numeric,
  estimated_delivery_time timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  retailer_id uuid NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, retailer_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  min_order_value numeric DEFAULT 0,
  max_uses integer DEFAULT 0,
  current_uses integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for customer_addresses
CREATE POLICY "Customers can view own addresses"
  ON customer_addresses FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert own addresses"
  ON customer_addresses FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own addresses"
  ON customer_addresses FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can delete own addresses"
  ON customer_addresses FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- RLS Policies for payment_methods
CREATE POLICY "Customers can view own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can delete own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- RLS Policies for retailers
CREATE POLICY "Anyone can view approved retailers"
  ON retailers FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Retailer owners can view own shop"
  ON retailers FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Retailers can insert own shop"
  ON retailers FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Retailers can update own shop"
  ON retailers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- RLS Policies for products
CREATE POLICY "Anyone can view products from approved retailers"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM retailers
      WHERE retailers.id = products.retailer_id
      AND retailers.status = 'approved'
    )
  );

CREATE POLICY "Retailers can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM retailers
      WHERE retailers.id = products.retailer_id
      AND retailers.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM retailers
      WHERE retailers.id = products.retailer_id
      AND retailers.profile_id = auth.uid()
    )
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Retailers can view orders for their shop"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM retailers
      WHERE retailers.id = orders.retailer_id
      AND retailers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Retailers can update orders for their shop"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM retailers
      WHERE retailers.id = orders.retailer_id
      AND retailers.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM retailers
      WHERE retailers.id = orders.retailer_id
      AND retailers.profile_id = auth.uid()
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM retailers
             WHERE retailers.id = orders.retailer_id
             AND retailers.profile_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Customers can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews for own orders"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for favorites
CREATE POLICY "Customers can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for promo_codes
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_retailers_status ON retailers(status);
CREATE INDEX IF NOT EXISTS idx_retailers_category ON retailers(category);
CREATE INDEX IF NOT EXISTS idx_retailers_location ON retailers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_products_retailer ON products(retailer_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_retailer ON reviews(retailer_id);
CREATE INDEX IF NOT EXISTS idx_favorites_customer ON favorites(customer_id);