-- ============================================================================
-- COMPLETE DATABASE SCHEMA - All Missing Features
-- Run this AFTER database-schema-updates.sql
-- ============================================================================

-- ============================================================================
-- 1. SLEEP & FATIGUE TRACKING
-- ============================================================================

-- Sleep logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    sleep_hours DECIMAL(3,1) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- Fatigue alerts table
CREATE TABLE IF NOT EXISTS fatigue_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    alert_date TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    reason TEXT NOT NULL,
    dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOS logs table
CREATE TABLE IF NOT EXISTS sos_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    resolved_at TIMESTAMPTZ
);

-- ============================================================================
-- 2. CYCLE AWARENESS (OPTIONAL)
-- ============================================================================

-- Cycle tracking table
CREATE TABLE IF NOT EXISTS cycle_tracking (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tracking_enabled BOOLEAN DEFAULT FALSE,
    cycle_start_date DATE,
    cycle_length INTEGER DEFAULT 28 CHECK (cycle_length >= 21 AND cycle_length <= 40),
    period_length INTEGER DEFAULT 5 CHECK (period_length >= 1 AND period_length <= 10),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Cycle logs table
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
-- 3. NOTIFICATIONS SYSTEM
-- ============================================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('shift_reminder', 'task_reminder', 'wellness_nudge', 'fatigue_alert', 'swap_request', 'announcement', 'achievement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notification preferences
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
-- 4. GAMIFICATION & ACHIEVEMENTS
-- ============================================================================

-- Badges/Achievements table
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT CHECK (category IN ('wellness', 'consistency', 'collaboration', 'milestone')),
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Wellness points table
CREATE TABLE IF NOT EXISTS wellness_points (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    points INTEGER DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_habits_completed INTEGER DEFAULT 0,
    total_moods_logged INTEGER DEFAULT 0,
    total_sleep_logged INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team challenges table
CREATE TABLE IF NOT EXISTS team_challenges (
    id BIGSERIAL PRIMARY KEY,
    circle_id BIGINT REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT CHECK (challenge_type IN ('mood_logging', 'habit_completion', 'sleep_tracking', 'wellness_score')),
    target_value INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id BIGSERIAL PRIMARY KEY,
    challenge_id BIGINT REFERENCES team_challenges(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    current_progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- ============================================================================
-- 5. AI ASSISTANT & RECOMMENDATIONS
-- ============================================================================

-- AI conversation history
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wellness recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT CHECK (recommendation_type IN ('rest', 'hydration', 'exercise', 'social', 'professional_help', 'break')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    based_on TEXT, -- What triggered this recommendation
    accepted BOOLEAN,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routine templates (learned from user behavior)
CREATE TABLE IF NOT EXISTS routine_templates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_condition TEXT, -- e.g., "after_night_shift", "high_stress_day"
    suggested_actions JSONB, -- Array of actions to take
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(3,2), -- 0-5 based on user feedback
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ
);

-- ============================================================================
-- 6. USER PREFERENCES & FEATURE TOGGLES
-- ============================================================================

-- User preferences table
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
-- 7. ANALYTICS & INSIGHTS
-- ============================================================================

-- Weekly wellness summaries (pre-calculated for performance)
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    avg_mood DECIMAL(3,2),
    avg_energy DECIMAL(3,2),
    avg_sleep_hours DECIMAL(3,2),
    total_work_hours DECIMAL(5,2),
    burnout_score DECIMAL(3,2),
    habits_completion_rate DECIMAL(3,2),
    tasks_completed INTEGER,
    wellness_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatigue_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Sleep logs policies
DROP POLICY IF EXISTS "Users can view own sleep logs" ON sleep_logs;
CREATE POLICY "Users can view own sleep logs" ON sleep_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sleep logs" ON sleep_logs;
CREATE POLICY "Users can insert own sleep logs" ON sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sleep logs" ON sleep_logs;
CREATE POLICY "Users can update own sleep logs" ON sleep_logs FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sleep logs" ON sleep_logs;
CREATE POLICY "Users can delete own sleep logs" ON sleep_logs FOR DELETE USING (auth.uid() = user_id);

-- Fatigue alerts policies
DROP POLICY IF EXISTS "Users can view own fatigue alerts" ON fatigue_alerts;
CREATE POLICY "Users can view own fatigue alerts" ON fatigue_alerts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fatigue alerts" ON fatigue_alerts;
CREATE POLICY "Users can insert own fatigue alerts" ON fatigue_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own fatigue alerts" ON fatigue_alerts;
CREATE POLICY "Users can update own fatigue alerts" ON fatigue_alerts FOR UPDATE USING (auth.uid() = user_id);

-- SOS logs policies
DROP POLICY IF EXISTS "Users can view own SOS logs" ON sos_logs;
CREATE POLICY "Users can view own SOS logs" ON sos_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own SOS logs" ON sos_logs;
CREATE POLICY "Users can insert own SOS logs" ON sos_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own SOS logs" ON sos_logs;
CREATE POLICY "Users can update own SOS logs" ON sos_logs FOR UPDATE USING (auth.uid() = user_id);

-- Cycle tracking policies
DROP POLICY IF EXISTS "Users can view own cycle tracking" ON cycle_tracking;
CREATE POLICY "Users can view own cycle tracking" ON cycle_tracking FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cycle tracking" ON cycle_tracking;
CREATE POLICY "Users can insert own cycle tracking" ON cycle_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cycle tracking" ON cycle_tracking;
CREATE POLICY "Users can update own cycle tracking" ON cycle_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Cycle logs policies
DROP POLICY IF EXISTS "Users can view own cycle logs" ON cycle_logs;
CREATE POLICY "Users can view own cycle logs" ON cycle_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cycle logs" ON cycle_logs;
CREATE POLICY "Users can insert own cycle logs" ON cycle_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cycle logs" ON cycle_logs;
CREATE POLICY "Users can update own cycle logs" ON cycle_logs FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cycle logs" ON cycle_logs;
CREATE POLICY "Users can delete own cycle logs" ON cycle_logs FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Notification preferences policies
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
CREATE POLICY "Users can view own notification preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;
CREATE POLICY "Users can insert own notification preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
CREATE POLICY "Users can update own notification preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Badges policies (public read, system write)
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT TO authenticated USING (true);

-- User badges policies
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Wellness points policies
DROP POLICY IF EXISTS "Users can view own wellness points" ON wellness_points;
CREATE POLICY "Users can view own wellness points" ON wellness_points FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wellness points" ON wellness_points;
CREATE POLICY "Users can update own wellness points" ON wellness_points FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wellness points" ON wellness_points;
CREATE POLICY "Users can insert own wellness points" ON wellness_points FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Team challenges policies
DROP POLICY IF EXISTS "Circle members can view challenges" ON team_challenges;
CREATE POLICY "Circle members can view challenges" ON team_challenges FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM circle_members
        WHERE circle_members.circle_id = team_challenges.circle_id
        AND circle_members.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Circle admins can insert challenges" ON team_challenges;
CREATE POLICY "Circle admins can insert challenges" ON team_challenges FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM circle_members
        WHERE circle_members.circle_id = team_challenges.circle_id
        AND circle_members.user_id = auth.uid()
        AND circle_members.role IN ('admin', 'owner')
    )
);

-- Challenge participants policies
DROP POLICY IF EXISTS "Users can view challenge participants in their circles" ON challenge_participants;
CREATE POLICY "Users can view challenge participants in their circles" ON challenge_participants FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM team_challenges tc
        JOIN circle_members cm ON cm.circle_id = tc.circle_id
        WHERE tc.id = challenge_participants.challenge_id
        AND cm.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges" ON challenge_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge progress" ON challenge_participants;
CREATE POLICY "Users can update own challenge progress" ON challenge_participants FOR UPDATE
USING (auth.uid() = user_id);

-- AI conversations policies
DROP POLICY IF EXISTS "Users can view own AI conversations" ON ai_conversations;
CREATE POLICY "Users can view own AI conversations" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own AI conversations" ON ai_conversations;
CREATE POLICY "Users can insert own AI conversations" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recommendations policies
DROP POLICY IF EXISTS "Users can view own recommendations" ON recommendations;
CREATE POLICY "Users can view own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendations" ON recommendations;
CREATE POLICY "Users can update own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Routine templates policies
DROP POLICY IF EXISTS "Users can view own routine templates" ON routine_templates;
CREATE POLICY "Users can view own routine templates" ON routine_templates FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own routine templates" ON routine_templates;
CREATE POLICY "Users can insert own routine templates" ON routine_templates FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own routine templates" ON routine_templates;
CREATE POLICY "Users can update own routine templates" ON routine_templates FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own routine templates" ON routine_templates;
CREATE POLICY "Users can delete own routine templates" ON routine_templates FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Weekly summaries policies
DROP POLICY IF EXISTS "Users can view own weekly summaries" ON weekly_summaries;
CREATE POLICY "Users can view own weekly summaries" ON weekly_summaries FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA - Default Badges
-- ============================================================================

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value)
VALUES
    ('Early Bird', 'Log your mood for 7 consecutive days', '🌅', 'consistency', 'daily_streak', 7),
    ('Wellness Warrior', 'Complete 50 habits', '💪', 'wellness', 'habits_completed', 50),
    ('Night Owl Champion', 'Complete 10 night shifts', '🦉', 'milestone', 'night_shifts', 10),
    ('Team Player', 'Accept 5 shift swap requests', '🤝', 'collaboration', 'swaps_accepted', 5),
    ('Sleep Champion', 'Log 7+ hours of sleep for 7 days', '😴', 'wellness', 'good_sleep_streak', 7),
    ('Hydration Hero', 'Log hydration for 30 days', '💧', 'consistency', 'hydration_days', 30),
    ('Self-Care Star', 'Complete 100 self-care tasks', '⭐', 'wellness', 'self_care_tasks', 100),
    ('Circle Creator', 'Create your first sync circle', '🎯', 'collaboration', 'circles_created', 1),
    ('Mood Master', 'Log your mood for 30 consecutive days', '😊', 'consistency', 'mood_streak', 30),
    ('Burnout Buster', 'Maintain low burnout score for 4 weeks', '🛡️', 'wellness', 'low_burnout_weeks', 4)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update wellness points
CREATE OR REPLACE FUNCTION update_wellness_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize wellness points if not exists
    INSERT INTO wellness_points (user_id, points, daily_streak, last_activity_date)
    VALUES (NEW.user_id, 0, 0, CURRENT_DATE)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update based on activity type
    IF TG_TABLE_NAME = 'mood_logs' THEN
        UPDATE wellness_points
        SET points = points + 5,
            total_moods_logged = total_moods_logged + 1,
            daily_streak = CASE
                WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN daily_streak + 1
                WHEN last_activity_date = CURRENT_DATE THEN daily_streak
                ELSE 1
            END,
            last_activity_date = CURRENT_DATE
        WHERE user_id = NEW.user_id;
    ELSIF TG_TABLE_NAME = 'habit_logs' THEN
        UPDATE wellness_points
        SET points = points + 3,
            total_habits_completed = total_habits_completed + 1
        WHERE user_id = NEW.user_id;
    ELSIF TG_TABLE_NAME = 'sleep_logs' THEN
        UPDATE wellness_points
        SET points = points + 5,
            total_sleep_logged = total_sleep_logged + 1
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for wellness points
DROP TRIGGER IF EXISTS mood_logs_wellness_points_trigger ON mood_logs;
CREATE TRIGGER mood_logs_wellness_points_trigger
    AFTER INSERT ON mood_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_wellness_points();

DROP TRIGGER IF EXISTS habit_logs_wellness_points_trigger ON habit_logs;
CREATE TRIGGER habit_logs_wellness_points_trigger
    AFTER INSERT ON habit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_wellness_points();

DROP TRIGGER IF EXISTS sleep_logs_wellness_points_trigger ON sleep_logs;
CREATE TRIGGER sleep_logs_wellness_points_trigger
    AFTER INSERT ON sleep_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_wellness_points();

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
    streak_count INTEGER;
    habit_count INTEGER;
    mood_count INTEGER;
    sleep_count INTEGER;
BEGIN
    -- Check for Early Bird badge (7 day mood streak)
    SELECT daily_streak INTO streak_count
    FROM wellness_points
    WHERE user_id = NEW.user_id;
    
    IF streak_count >= 7 THEN
        INSERT INTO user_badges (user_id, badge_id)
        SELECT NEW.user_id, id FROM badges WHERE name = 'Early Bird'
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Check for Wellness Warrior badge (50 habits)
    SELECT total_habits_completed INTO habit_count
    FROM wellness_points
    WHERE user_id = NEW.user_id;
    
    IF habit_count >= 50 THEN
        INSERT INTO user_badges (user_id, badge_id)
        SELECT NEW.user_id, id FROM badges WHERE name = 'Wellness Warrior'
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Check for Mood Master badge (30 day mood streak)
    IF streak_count >= 30 THEN
        INSERT INTO user_badges (user_id, badge_id)
        SELECT NEW.user_id, id FROM badges WHERE name = 'Mood Master'
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for badge checking
DROP TRIGGER IF EXISTS wellness_points_badge_check_trigger ON wellness_points;
CREATE TRIGGER wellness_points_badge_check_trigger
    AFTER UPDATE ON wellness_points
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_badges();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_fatigue_alerts_user_date ON fatigue_alerts(user_id, alert_date DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_logs_user_date ON cycle_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_points_user ON wellness_points(user_id);
CREATE INDEX IF NOT EXISTS idx_team_challenges_circle ON team_challenges(circle_id, status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id, dismissed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_date ON weekly_summaries(user_id, week_start_date DESC);

-- ============================================================================
-- COMPLETE! Run this script in Supabase SQL Editor
-- ============================================================================
