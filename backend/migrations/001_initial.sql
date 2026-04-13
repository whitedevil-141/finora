-- ============================================================
-- Finora Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'John Doe',
    email TEXT NOT NULL DEFAULT 'john.doe@finspace.app',
    avatar_url TEXT,
    currency TEXT NOT NULL DEFAULT 'BDT',
    notifications BOOLEAN NOT NULL DEFAULT true,
    app_lock BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    type TEXT NOT NULL DEFAULT 'checking' CHECK (type IN ('checking', 'savings', 'cash')),
    is_synced BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_synced BOOLEAN NOT NULL DEFAULT true,
    pending BOOLEAN NOT NULL DEFAULT false,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Categories table (default + user-custom)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT NOT NULL
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed: Default categories
-- ============================================================
INSERT INTO categories (id, user_id, name, type, icon) VALUES
    ('e1', NULL, 'Food & Dining', 'expense', 'Utensils'),
    ('e2', NULL, 'Shopping', 'expense', 'ShoppingBag'),
    ('e3', NULL, 'Transportation', 'expense', 'Car'),
    ('e4', NULL, 'Utilities', 'expense', 'Zap'),
    ('e5', NULL, 'Subscriptions', 'expense', 'Monitor'),
    ('e6', NULL, 'Health', 'expense', 'Stethoscope'),
    ('e7', NULL, 'Travel', 'expense', 'Plane'),
    ('e8', NULL, 'Others', 'expense', 'LayoutGrid'),
    ('i1', NULL, 'Salary', 'income', 'Briefcase'),
    ('i2', NULL, 'Freelance', 'income', 'Smartphone'),
    ('i3', NULL, 'Investment', 'income', 'TrendingUp'),
    ('i4', NULL, 'Gift', 'income', 'Gift'),
    ('i5', NULL, 'Other Income', 'income', 'ArrowUpRight')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Seed: Default user (for development)
-- ============================================================
INSERT INTO users (id, name, email) VALUES
    ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john.doe@finspace.app')
ON CONFLICT (id) DO NOTHING;

-- Seed: Default accounts for the test user
INSERT INTO accounts (id, user_id, name, balance, type) VALUES
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Main Bank', 4250.00, 'checking'),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Cash Wallet', 350.00, 'cash')
ON CONFLICT (id) DO NOTHING;

-- Seed: Sample transactions
INSERT INTO transactions (user_id, account_id, amount, category, title, type, date, is_synced) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', -45.50, 'Food & Dining', 'Whole Foods Market', 'expense', '2026-04-09T14:30:00Z', false),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', -12.99, 'Subscriptions', 'Netflix', 'expense', '2026-04-08T09:00:00Z', true),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 3200.00, 'Salary', 'Monthly Salary', 'income', '2026-04-01T08:00:00Z', true),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', -120.00, 'Utilities', 'Electric Bill', 'expense', '2026-03-28T10:15:00Z', true),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 500.00, 'Other Income', 'ATM Withdrawal', 'income', '2026-03-25T11:00:00Z', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Row Level Security (RLS) - optional, enable for production
-- ============================================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
