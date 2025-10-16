-- ENSURE PROFILES TABLE HAS ALL NECESSARY COLUMNS
-- Run this before inserting dummy data if you get column errors

-- Add avatar_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '✓ Added avatar_url column to profiles table';
    ELSE
        RAISE NOTICE '✓ avatar_url column already exists';
    END IF;
END $$;

-- Verify the profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Show current profiles data
SELECT * FROM profiles LIMIT 5;
