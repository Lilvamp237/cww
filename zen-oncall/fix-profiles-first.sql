-- ============================================================================
-- FIX: Add missing columns to existing tables
-- Run this FIRST before the main schema
-- ============================================================================

-- Add role column to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'nurse';
    END IF;
END $$;

-- Add specialty column to profiles if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='specialty' AND column_name='specialty') THEN
        ALTER TABLE profiles ADD COLUMN specialty TEXT;
    END IF;
END $$;

-- Now run the main schema
-- Copy and paste database-schema-STANDALONE.sql content below this line
