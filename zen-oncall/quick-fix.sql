-- QUICK FIX FOR CIRCLE ISSUES
-- Run this in Supabase SQL Editor to fix:
-- 1. Members not showing
-- 2. Can't post announcements  
-- 3. Schedule not visible

-- First, let's check if columns exist and add them if needed
DO $$ 
BEGIN
    -- Add privacy columns to circle_members if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'circle_members' AND column_name = 'share_shifts'
    ) THEN
        ALTER TABLE circle_members ADD COLUMN share_shifts BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'circle_members' AND column_name = 'share_status'
    ) THEN
        ALTER TABLE circle_members ADD COLUMN share_status BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Update existing members to have privacy settings enabled by default
UPDATE circle_members 
SET share_shifts = TRUE, share_status = TRUE 
WHERE share_shifts IS NULL OR share_status IS NULL;

-- Check if profiles table exists and has data
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Create profiles table if it doesn't exist
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view all profiles" ON profiles
            FOR SELECT USING (TRUE);

        CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);

        CREATE POLICY "Users can insert their own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Create a function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing users who don't have profiles
INSERT INTO profiles (id, full_name)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 
    'circle_members count' as check_type,
    COUNT(*) as count
FROM circle_members
UNION ALL
SELECT 
    'profiles count' as check_type,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'shifts count' as check_type,
    COUNT(*) as count
FROM shifts;

-- Show your user info
SELECT 
    p.id,
    p.full_name,
    (SELECT COUNT(*) FROM circle_members cm WHERE cm.user_id = p.id) as circles_count,
    (SELECT COUNT(*) FROM shifts s WHERE s.user_id = p.id) as shifts_count
FROM profiles p
WHERE p.id = auth.uid();

-- ------------------------------------------------------------------
-- Ensure shifts have category and color columns (used by frontend)
-- ------------------------------------------------------------------
DO $$
BEGIN
        IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'shifts' AND column_name = 'category'
        ) THEN
                ALTER TABLE shifts ADD COLUMN category TEXT DEFAULT 'work';
        END IF;

        IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'shifts' AND column_name = 'color'
        ) THEN
                ALTER TABLE shifts ADD COLUMN color TEXT DEFAULT '#3b82f6';
        END IF;
END $$;

-- ------------------------------------------------------------------
-- Ensure circle_announcements exists (used for postings/feeds)
-- ------------------------------------------------------------------
DO $$
BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'circle_announcements') THEN
                CREATE TABLE circle_announcements (
                        id BIGSERIAL PRIMARY KEY,
                        circle_id BIGINT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
                        author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        priority TEXT DEFAULT 'normal',
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                -- Enable RLS and create minimal policies so members can use it
                ALTER TABLE circle_announcements ENABLE ROW LEVEL SECURITY;

                CREATE POLICY "Circle members can view announcements" ON circle_announcements
                    FOR SELECT USING (
                        EXISTS (
                            SELECT 1 FROM circle_members
                            WHERE circle_members.circle_id = circle_announcements.circle_id
                            AND circle_members.user_id = auth.uid()
                        )
                    );

                CREATE POLICY "Circle members can create announcements" ON circle_announcements
                    FOR INSERT WITH CHECK (
                        auth.uid() = author_id AND
                        EXISTS (
                            SELECT 1 FROM circle_members
                            WHERE circle_members.circle_id = circle_announcements.circle_id
                            AND circle_members.user_id = auth.uid()
                        )
                    );

                CREATE POLICY "Authors can update their own announcements" ON circle_announcements
                    FOR UPDATE USING (auth.uid() = author_id);

                CREATE POLICY "Authors can delete their own announcements" ON circle_announcements
                    FOR DELETE USING (auth.uid() = author_id);

                CREATE INDEX IF NOT EXISTS idx_announcements_circle ON circle_announcements(circle_id, created_at DESC);
        END IF;
END $$;

-- Re-run verification including announcements and shift columns
SELECT 'circle_announcements count' as check_type, COUNT(*) as count FROM circle_announcements
UNION ALL
SELECT 'shifts count' as check_type, COUNT(*) as count FROM shifts
UNION ALL
SELECT 'shifts has category column' as check_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'category') as count
UNION ALL
SELECT 'shifts has color column' as check_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'color') as count;
