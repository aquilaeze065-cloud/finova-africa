CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  account_status VARCHAR(20) DEFAULT 'pending',
  reg_fee_paid BOOLEAN DEFAULT false,
  reg_fee_submitted BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  contract_signed_at TIMESTAMP,
  contract_signature VARCHAR(255),
  kyc_submitted BOOLEAN DEFAULT false,
  kyc_status VARCHAR(20) DEFAULT 'unverified',
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  dob DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  nationality VARCHAR(100),
  occupation VARCHAR(100),
  phone VARCHAR(20),
  alt_phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  bvn VARCHAR(11),
  nin VARCHAR(11),
  nok_name VARCHAR(255),
  nok_phone VARCHAR(20),
  nok_relation VARCHAR(50),
  nok_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  btc_address VARCHAR(255),
  eth_address VARCHAR(255),
  usdt_trc20_address VARCHAR(255),
  bnb_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  btc DECIMAL(20,8) DEFAULT 0,
  eth DECIMAL(20,8) DEFAULT 0,
  usdt DECIMAL(20,8) DEFAULT 0,
  bnb DECIMAL(20,8) DEFAULT 0,
  ngn DECIMAL(20,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  crypto VARCHAR(10),
  amount DECIMAL(20,8),
  usd_value DECIMAL(20,2),
  ngn_value DECIMAL(20,2),
  to_address VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  tx_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'registration',
  amount DECIMAL(20,8),
  currency VARCHAR(10),
  network VARCHAR(20),
  tx_hash VARCHAR(255),
  screenshot_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  review_note TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  id_type VARCHAR(50),
  id_front_url VARCHAR(500),
  id_back_url VARCHAR(500),
  selfie_url VARCHAR(500),
  address_doc_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  review_note TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS savings_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  total_paid DECIMAL(20,2) DEFAULT 0,
  missed_weeks INT DEFAULT 0,
  penalty_weeks INT DEFAULT 0,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES savings_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_number INT,
  due_date TIMESTAMP,
  grace_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'upcoming',
  paid_amount DECIMAL(20,2) DEFAULT 0,
  paid_at TIMESTAMP,
  is_penalty BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  title VARCHAR(255),
  body TEXT,
  icon VARCHAR(10),
  read BOOLEAN DEFAULT false,
  action VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  weekly_reminder BOOLEAN DEFAULT true,
  payment_confirm BOOLEAN DEFAULT true,
  kyc_updates BOOLEAN DEFAULT true,
  price_alerts BOOLEAN DEFAULT false,
  promotions BOOLEAN DEFAULT false,
  admin_messages BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_weeks_plan ON savings_weeks(plan_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
