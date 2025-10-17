-- ============================================================================
-- ADD MISSING TABLES - Safe to run with existing tables
-- Run this in Supabase SQL Editor after minimal-schema.sql
-- ============================================================================

-- First, add role/specialty columns to profiles if they don't exist
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'nurse';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS specialty TEXT;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Circles (teams/groups)
CREATE TABLE IF NOT EXISTS circles (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle members
CREATE TABLE IF NOT EXISTS circle_members (
    id BIGSERIAL PRIMARY KEY,
    circle_id BIGINT REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(circle_id, user_id)
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    shift_type TEXT DEFAULT 'day' CHECK (shift_type IN ('day', 'night', 'swing')),
    location TEXT,
    notes TEXT,
    category TEXT DEFAULT 'work',
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal tasks table
CREATE TABLE IF NOT EXISTS personal_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    due_time TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category TEXT DEFAULT 'personal',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood logs table
CREATE TABLE IF NOT EXISTS mood_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 5) NOT NULL,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT DEFAULT 'daily',
    target_count INTEGER DEFAULT 1,
    icon TEXT,
    color TEXT DEFAULT '#10b981',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs table
CREATE TABLE IF NOT EXISTS habit_logs (
    id BIGSERIAL PRIMARY KEY,
    habit_id BIGINT REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    count INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, log_date)
);

-- Sleep logs table
CREATE TABLE IF NOT EXISTS sleep_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24) NOT NULL,
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

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('shift', 'task', 'wellness', 'fatigue', 'circle', 'achievement', 'reminder')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GAMIFICATION & ACHIEVEMENTS
-- ============================================================================

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
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
-- AI ASSISTANT & RECOMMENDATIONS
-- ============================================================================

-- AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT CHECK (recommendation_type IN ('rest', 'exercise', 'social', 'nutrition', 'sleep', 'mindfulness', 'task')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'medium', 'high')),
    based_on TEXT,
    accepted BOOLEAN,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routine templates table
CREATE TABLE IF NOT EXISTS routine_templates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger_condition TEXT,
    suggested_actions JSONB,
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ
);

-- Weekly summaries table
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
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatigue_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Circles policies
DROP POLICY IF EXISTS "Users can view circles they are members of" ON circles;
CREATE POLICY "Users can view circles they are members of" ON circles FOR SELECT
USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circles.id AND circle_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create circles" ON circles;
CREATE POLICY "Users can create circles" ON circles FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Circle members policies
DROP POLICY IF EXISTS "Users can view members in their circles" ON circle_members;
CREATE POLICY "Users can view members in their circles" ON circle_members FOR SELECT
USING (EXISTS (SELECT 1 FROM circle_members cm WHERE cm.circle_id = circle_members.circle_id AND cm.user_id = auth.uid()));

DROP POLICY IF EXISTS "Circle owners can manage members" ON circle_members;
CREATE POLICY "Circle owners can manage members" ON circle_members FOR ALL
USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_id = circle_members.circle_id AND user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Shifts, tasks, wellness data - users manage their own
DROP POLICY IF EXISTS "Users manage own shifts" ON shifts;
CREATE POLICY "Users manage own shifts" ON shifts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own tasks" ON personal_tasks;
CREATE POLICY "Users manage own tasks" ON personal_tasks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own mood logs" ON mood_logs;
CREATE POLICY "Users manage own mood logs" ON mood_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own habits" ON habits;
CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own habit logs" ON habit_logs;
CREATE POLICY "Users manage own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own sleep logs" ON sleep_logs;
CREATE POLICY "Users manage own sleep logs" ON sleep_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own fatigue alerts" ON fatigue_alerts;
CREATE POLICY "Users manage own fatigue alerts" ON fatigue_alerts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own SOS logs" ON sos_logs;
CREATE POLICY "Users manage own SOS logs" ON sos_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own notifications" ON notifications;
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users view own badges" ON user_badges;
CREATE POLICY "Users view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own wellness points" ON wellness_points;
CREATE POLICY "Users manage own wellness points" ON wellness_points FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Circle members view challenges" ON team_challenges;
CREATE POLICY "Circle members view challenges" ON team_challenges FOR SELECT
USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = team_challenges.circle_id AND circle_members.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users manage own challenge participation" ON challenge_participants;
CREATE POLICY "Users manage own challenge participation" ON challenge_participants FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own AI conversations" ON ai_conversations;
CREATE POLICY "Users manage own AI conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own recommendations" ON recommendations;
CREATE POLICY "Users manage own recommendations" ON recommendations FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own routine templates" ON routine_templates;
CREATE POLICY "Users manage own routine templates" ON routine_templates FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own weekly summaries" ON weekly_summaries;
CREATE POLICY "Users view own weekly summaries" ON weekly_summaries FOR SELECT USING (auth.uid() = user_id);

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
    ('Mood Master', 'Log your mood for 30 consecutive days', '😊', 'consistency', 'mood_streak', 30)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shifts_user_time ON shifts(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON personal_tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON mood_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%'
ORDER BY table_name;
