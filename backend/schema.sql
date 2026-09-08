-- Digital City ERP Standalone PostgreSQL Local Database Schema
-- Created for local development on /home/meriko/digitalcity-backend/

CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  duration_months INTEGER DEFAULT 1,
  warranty_type VARCHAR(20) DEFAULT 'Full',
  warranty_months INTEGER,
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  delivery_method VARCHAR(50) DEFAULT 'Email & Password',
  required_fields JSONB DEFAULT '[]'::jsonb,
  dynamic_fields_config JSONB DEFAULT '[]'::jsonb,
  fixed_cost NUMERIC(12, 2),
  default_selling_price NUMERIC(12, 2),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discounts (
  id TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL,
  discount_category VARCHAR(50) DEFAULT 'Percentage',
  default_value NUMERIC(12, 2),
  config_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  days_before INTEGER DEFAULT 7,
  frequency VARCHAR(50) DEFAULT 'Daily',
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS automations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'Enabled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id TEXT PRIMARY KEY,
  serial_number SERIAL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  tags TEXT,
  type VARCHAR(20) DEFAULT 'Regular',
  platform VARCHAR(50) DEFAULT 'Facebook Page',
  first_purchase_date DATE DEFAULT CURRENT_DATE,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  receipt_id VARCHAR(20) NOT NULL UNIQUE,
  tracking_id VARCHAR(50),
  customer_id TEXT REFERENCES customers(customer_id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  category_id TEXT,
  category_name TEXT,
  product_id TEXT REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_code VARCHAR(10),
  plan_id TEXT,
  plan_name TEXT NOT NULL,
  plan_code VARCHAR(20),
  supplier_id TEXT REFERENCES suppliers(id),
  supplier_name TEXT,
  supplier_code VARCHAR(10),
  household_id TEXT REFERENCES households(id),
  household_name TEXT,
  household_code VARCHAR(20),
  duration_months INTEGER DEFAULT 1,
  duration_formatted TEXT,
  delivery_method VARCHAR(50) DEFAULT 'Email & Password',
  account_email TEXT,
  account_password TEXT,
  activation_url TEXT,
  account_details JSONB DEFAULT '{}'::jsonb,
  quantity INTEGER DEFAULT 1,
  total_amount NUMERIC(12, 2) DEFAULT 0.00,
  base_price NUMERIC(12, 2) DEFAULT 0.00,
  discount_type VARCHAR(50),
  discount_value NUMERIC(12, 2) DEFAULT 0.00,
  cost_price NUMERIC(12, 2) DEFAULT 0.00,
  selling_price NUMERIC(12, 2) DEFAULT 0.00,
  net_profit NUMERIC(12, 2) DEFAULT 0.00,
  order_date DATE DEFAULT CURRENT_DATE,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  warranty_days INTEGER DEFAULT 30,
  warranty_status VARCHAR(20) DEFAULT 'Active',
  daily_refund_mmk NUMERIC(12, 2) DEFAULT 0.00,
  total_refund_available NUMERIC(12, 2) DEFAULT 0.00,
  order_stage VARCHAR(50) DEFAULT 'Completed',
  is_paid BOOLEAN DEFAULT TRUE,
  is_done BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'Completed',
  is_refunded BOOLEAN DEFAULT FALSE,
  refund_date DATE,
  refund_amount NUMERIC(12, 2) DEFAULT 0.00,
  is_replaced BOOLEAN DEFAULT FALSE,
  replacement_date DATE,
  replacement_note TEXT,
  is_reminded BOOLEAN DEFAULT FALSE,
  reminder_schedule TEXT,
  sales_channel VARCHAR(50) DEFAULT 'POS Direct',
  platform VARCHAR(50) DEFAULT 'Facebook Page',
  cashier VARCHAR(50) DEFAULT 'maunglenn',
  extension_count INTEGER DEFAULT 0,
  credential_history JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warranty_records (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  receipt_id VARCHAR(20),
  tracking_id VARCHAR(50),
  customer_id TEXT REFERENCES customers(customer_id),
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  supplier_name TEXT,
  final_paid_amount NUMERIC(12, 2) DEFAULT 0.00,
  warranty_duration_days INTEGER DEFAULT 30,
  start_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  remaining_days INTEGER DEFAULT 30,
  daily_refund_mmk NUMERIC(12, 2) DEFAULT 0.00,
  total_refund_available NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refund_requests (
  id TEXT PRIMARY KEY,
  warranty_id TEXT REFERENCES warranty_records(id),
  order_id TEXT REFERENCES orders(id),
  request_date DATE DEFAULT CURRENT_DATE,
  refund_date DATE,
  refund_amount NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS replacement_requests (
  id TEXT PRIMARY KEY,
  warranty_id TEXT REFERENCES warranty_records(id),
  order_id TEXT REFERENCES orders(id),
  request_date DATE DEFAULT CURRENT_DATE,
  replacement_date DATE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'Completed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warranty_extensions (
  id TEXT PRIMARY KEY,
  warranty_id TEXT REFERENCES warranty_records(id),
  order_id TEXT REFERENCES orders(id),
  extension_date DATE DEFAULT CURRENT_DATE,
  added_days INTEGER DEFAULT 30,
  new_expiry_date DATE NOT NULL,
  type VARCHAR(50) DEFAULT 'Monthly Account Renewal',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Categories & Products
INSERT INTO categories (id, name, admin_note) VALUES
  ('cat_1', 'Design & Video', 'Video editing and graphics tools'),
  ('cat_2', 'Streaming', 'Movie and music entertainment subscriptions'),
  ('cat_3', 'Productivity', 'Office and design team accounts'),
  ('cat_4', 'Music', 'Audio streaming services')
ON CONFLICT (name) DO NOTHING;

INSERT INTO households (id, name, code, admin_note) VALUES
  ('h1', 'CapCut Family Pool A', 'CC-FAM-01', 'Shared family subscription'),
  ('h2', 'CapCut Family Pool B', 'CC-FAM-02', '1-Year family plan slot'),
  ('h3', 'Netflix Singapore Slot', 'NF-SG-99', 'Premium 4K SG Region'),
  ('h4', 'Canva Edu Team 8', 'CNV-TEAM-08', 'Education unlimited team')
ON CONFLICT (code) DO NOTHING;

INSERT INTO suppliers (id, name, code, admin_note) VALUES
  ('s1', 'Global Tech Distribution', 'SUP01', 'Direct wholesale supplier'),
  ('s2', 'Asia Digital Solutions', 'SUP02', 'CapCut & Canva key distributor')
ON CONFLICT (code) DO NOTHING;
