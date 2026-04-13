-- ============================================================
-- Finora Auth Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- Adds password_hash and provider columns for authentication
-- ============================================================

-- Add password_hash column (nullable — Google users won't have one)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add provider column to track how user signed up
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'email';

-- Add unique constraint on email to prevent duplicate registrations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
END $$;

-- Create index on email for fast lookup during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
