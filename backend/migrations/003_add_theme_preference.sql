-- Add theme_preference to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'dark';

-- Add constraint to ensure valid values
ALTER TABLE users ADD CONSTRAINT valid_theme_preference CHECK (theme_preference IN ('dark', 'light'));
