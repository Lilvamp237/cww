-- Create Essential Tables for Settings & Cycle Tracking
-- Run this in Supabase SQL Editor

-- ============================================================================
-- USER PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Feature toggles
    feature_scheduler BOOLEAN DEFAULT TRUE,
    feature_circles BOOLEAN DEFAULT TRUE,
    feature_wellness BOOLEAN DEFAULT TRUE,
    feature_assistant BOOLEAN DEFAULT TRUE,
    feature_cycle_tracking BOOLEAN DEFAULT FALSE,
    feature_gamification BOOLEAN DEFAULT TRUE,
    feature_analytics BOOLEAN DEFAULT TRUE,
    
    -- Display preferences
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    default_view TEXT DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'scheduler', 'wellness', 'circles')),
    calendar_start_day INTEGER DEFAULT 0 CHECK (calendar_start_day >= 0 AND calendar_start_day <= 6),
    
    -- Privacy preferences
    profile_visibility TEXT DEFAULT 'circles' CHECK (profile_visibility IN ('public', 'circles', 'private')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CYCLE TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cycle_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tracking_enabled BOOLEAN DEFAULT FALSE,
    cycle_start_date DATE,
    cycle_length INTEGER DEFAULT 28 CHECK (cycle_length >= 21 AND cycle_length <= 40),
    period_length INTEGER DEFAULT 5 CHECK (period_length >= 1 AND period_length <= 10),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CYCLE LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cycle_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    phase TEXT CHECK (phase IN ('menstrual', 'follicular', 'ovulation', 'luteal')),
    symptoms TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    shift_reminders BOOLEAN DEFAULT TRUE,
    shift_reminder_minutes INTEGER DEFAULT 60,
    task_reminders BOOLEAN DEFAULT TRUE,
    wellness_nudges BOOLEAN DEFAULT TRUE,
    fatigue_alerts BOOLEAN DEFAULT TRUE,
    circle_notifications BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    email_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
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

-- Cycle Tracking Policies
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

-- Cycle Logs Policies
CREATE POLICY "Users can view own cycle logs"
ON cycle_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle logs"
ON cycle_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle logs"
ON cycle_logs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Notification Preferences Policies
CREATE POLICY "Users can view own notification preferences"
ON notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
ON notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
ON notification_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check that tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_preferences', 'cycle_tracking', 'cycle_logs', 'notification_preferences')
ORDER BY table_name;
