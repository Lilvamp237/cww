-- Fix RLS Policies for Settings & Cycle Tracking
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

DROP POLICY IF EXISTS "Users can manage own cycle tracking" ON cycle_tracking;
DROP POLICY IF EXISTS "Users can view own cycle tracking" ON cycle_tracking;
DROP POLICY IF EXISTS "Users can insert own cycle tracking" ON cycle_tracking;
DROP POLICY IF EXISTS "Users can update own cycle tracking" ON cycle_tracking;

-- Enable RLS on tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_tracking ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for user_preferences
CREATE POLICY "Users can view own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create comprehensive policies for cycle_tracking
CREATE POLICY "Users can view own cycle tracking"
ON cycle_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle tracking"
ON cycle_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle tracking"
ON cycle_tracking FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('user_preferences', 'cycle_tracking')
ORDER BY tablename, policyname;
