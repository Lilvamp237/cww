-- Update profiles table with comprehensive medical professional fields
-- Run this in your Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS medical_profession TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS sub_specialty TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS hospital_name TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS work_location TEXT,
ADD COLUMN IF NOT EXISTS shift_type TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add check constraints (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_years_experience'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT check_years_experience CHECK (years_of_experience >= 0 AND years_of_experience <= 60);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_bio_length'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT check_bio_length CHECK (LENGTH(bio) <= 500);
  END IF;
END $$;

-- Create index for common searches
CREATE INDEX IF NOT EXISTS idx_profiles_profession ON profiles(medical_profession);
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_hospital ON profiles(hospital_name);

-- Add comment to table
COMMENT ON TABLE profiles IS 'Comprehensive user profiles including medical professional information';

-- Display success message
SELECT 'Profiles table updated successfully with medical professional fields!' as message;
