-- ============================================================================
-- QUICK SETUP: Create Essential Tables + Test Data
-- Run this ONCE in Supabase SQL Editor - Takes 30 seconds
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE TABLES (Only the ones your app actually uses)
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
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(circle_id, user_id)
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    shift_type TEXT DEFAULT 'day',
    location TEXT,
    notes TEXT,
    category TEXT DEFAULT 'work',
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal tasks
CREATE TABLE IF NOT EXISTS personal_tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'personal',
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood logs
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

-- Sleep logs
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

-- Habits
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs
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

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Wellness points
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

-- AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommendation_type TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    based_on TEXT,
    accepted BOOLEAN,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fatigue alerts
CREATE TABLE IF NOT EXISTS fatigue_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    alert_date TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT,
    reason TEXT NOT NULL,
    dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: ENABLE RLS (Row Level Security)
-- ============================================================================

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatigue_alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: CREATE RLS POLICIES (Allow users to manage their own data)
-- ============================================================================

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users manage own shifts" ON shifts;
DROP POLICY IF EXISTS "Users manage own tasks" ON personal_tasks;
DROP POLICY IF EXISTS "Users manage own mood logs" ON mood_logs;
DROP POLICY IF EXISTS "Users manage own sleep logs" ON sleep_logs;
DROP POLICY IF EXISTS "Users manage own habits" ON habits;
DROP POLICY IF EXISTS "Users manage own habit logs" ON habit_logs;
DROP POLICY IF EXISTS "Users manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users manage own wellness points" ON wellness_points;
DROP POLICY IF EXISTS "Users manage own AI conversations" ON ai_conversations;
DROP POLICY IF EXISTS "Users manage own recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users manage own fatigue alerts" ON fatigue_alerts;
DROP POLICY IF EXISTS "Anyone can view badges" ON badges;
DROP POLICY IF EXISTS "Users view own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view circles they are in" ON circles;
DROP POLICY IF EXISTS "Users can create circles" ON circles;
DROP POLICY IF EXISTS "Users can view members in their circles" ON circle_members;

-- Personal data policies (users manage their own)
CREATE POLICY "Users manage own shifts" ON shifts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tasks" ON personal_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own mood logs" ON mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own sleep logs" ON sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own wellness points" ON wellness_points FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own AI conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recommendations" ON recommendations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own fatigue alerts" ON fatigue_alerts FOR ALL USING (auth.uid() = user_id);

-- Badges (everyone can view)
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

-- Circles policies
CREATE POLICY "Users can view circles they are in" ON circles FOR SELECT
USING (EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = circles.id AND circle_members.user_id = auth.uid()));

CREATE POLICY "Users can create circles" ON circles FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view members in their circles" ON circle_members FOR SELECT
USING (EXISTS (SELECT 1 FROM circle_members cm WHERE cm.circle_id = circle_members.circle_id AND cm.user_id = auth.uid()));

-- ============================================================================
-- PART 4: ADD SAMPLE BADGES (For gamification)
-- ============================================================================

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value)
VALUES
    ('Early Bird', 'Log your mood for 7 consecutive days', '🌅', 'consistency', 'daily_streak', 7),
    ('Wellness Warrior', 'Complete 50 habits', '💪', 'wellness', 'habits_completed', 50),
    ('Sleep Champion', 'Log 7+ hours of sleep for 7 days', '😴', 'wellness', 'good_sleep_streak', 7),
    ('Mood Master', 'Log your mood for 30 consecutive days', '😊', 'consistency', 'mood_streak', 30),
    ('Task Crusher', 'Complete 25 personal tasks', '✅', 'milestone', 'tasks_completed', 25),
    ('Team Player', 'Join 3 sync circles', '🤝', 'collaboration', 'circles_joined', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PART 5: ADD TEST DATA (Replace YOUR_USER_ID with your actual Supabase user ID)
-- ============================================================================

-- Get your user ID by running: SELECT auth.uid(); in Supabase SQL editor while logged in
-- Then replace 'YOUR_USER_ID' below with your actual UUID

DO $$
DECLARE
    test_user_id UUID;
    test_circle_id BIGINT;
    test_habit_id BIGINT;
BEGIN
    -- Get the current logged-in user's ID
    test_user_id := auth.uid();
    
    -- Skip if no user is logged in
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No user logged in. Please log in and run again.';
        RETURN;
    END IF;

    RAISE NOTICE 'Adding test data for user: %', test_user_id;

    -- Create a test circle
    INSERT INTO circles (name, description, created_by)
    VALUES ('Emergency Department', 'ED Team - Night Shift Crew', test_user_id)
    RETURNING id INTO test_circle_id;

    -- Add user to the circle
    INSERT INTO circle_members (circle_id, user_id, role)
    VALUES (test_circle_id, test_user_id, 'owner');

    -- Add some shifts (last 3 days and next 4 days)
    INSERT INTO shifts (user_id, start_time, end_time, shift_type, location, category)
    VALUES
        (test_user_id, NOW() - INTERVAL '3 days' + INTERVAL '7 hours', NOW() - INTERVAL '3 days' + INTERVAL '19 hours', 'day', 'Emergency Department', 'work'),
        (test_user_id, NOW() - INTERVAL '1 day' + INTERVAL '19 hours', NOW() - INTERVAL '1 day' + INTERVAL '31 hours', 'night', 'Emergency Department', 'work'),
        (test_user_id, NOW() + INTERVAL '1 day' + INTERVAL '7 hours', NOW() + INTERVAL '1 day' + INTERVAL '19 hours', 'day', 'Emergency Department', 'work'),
        (test_user_id, NOW() + INTERVAL '3 days' + INTERVAL '19 hours', NOW() + INTERVAL '3 days' + INTERVAL '31 hours', 'night', 'Emergency Department', 'work');

    -- Add some personal tasks
    INSERT INTO personal_tasks (user_id, title, description, due_date, priority, category, completed)
    VALUES
        (test_user_id, 'Grocery shopping', 'Get vegetables, milk, eggs', NOW() + INTERVAL '1 day', 'medium', 'personal', false),
        (test_user_id, 'Call mom', 'Check in about her appointment', NOW() + INTERVAL '2 days', 'high', 'personal', false),
        (test_user_id, 'Renew car insurance', 'Due next week', NOW() + INTERVAL '5 days', 'high', 'important', false),
        (test_user_id, 'Yoga class', 'Evening class at 6 PM', NOW() + INTERVAL '2 days', 'low', 'wellness', false),
        (test_user_id, 'Meal prep Sunday', 'Prepare meals for the week', NOW() - INTERVAL '1 day', 'medium', 'wellness', true);

    -- Add mood logs (last 7 days)
    INSERT INTO mood_logs (user_id, log_date, mood, energy_level, stress_level, notes)
    VALUES
        (test_user_id, CURRENT_DATE - 6, 3, 3, 3, 'Normal day, feeling okay'),
        (test_user_id, CURRENT_DATE - 5, 4, 4, 2, 'Good day! Had enough sleep'),
        (test_user_id, CURRENT_DATE - 4, 2, 2, 4, 'Rough shift, very tired'),
        (test_user_id, CURRENT_DATE - 3, 3, 3, 3, 'Getting better'),
        (test_user_id, CURRENT_DATE - 2, 4, 4, 2, 'Rested and energized'),
        (test_user_id, CURRENT_DATE - 1, 3, 3, 3, 'Steady mood'),
        (test_user_id, CURRENT_DATE, 4, 4, 2, 'Feeling great today!');

    -- Add sleep logs (last 7 days)
    INSERT INTO sleep_logs (user_id, log_date, sleep_hours, sleep_quality, notes)
    VALUES
        (test_user_id, CURRENT_DATE - 6, 6.5, 3, 'Woke up a few times'),
        (test_user_id, CURRENT_DATE - 5, 8.0, 4, 'Solid sleep'),
        (test_user_id, CURRENT_DATE - 4, 5.5, 2, 'Had trouble falling asleep'),
        (test_user_id, CURRENT_DATE - 3, 7.0, 3, 'Decent rest'),
        (test_user_id, CURRENT_DATE - 2, 8.5, 5, 'Best sleep in a while!'),
        (test_user_id, CURRENT_DATE - 1, 7.5, 4, 'Felt refreshed'),
        (test_user_id, CURRENT_DATE, 7.0, 4, 'Good night');

    -- Create a habit
    INSERT INTO habits (user_id, name, description, frequency, target_count, icon, color)
    VALUES (test_user_id, 'Drink water', 'Stay hydrated - 8 glasses', 'daily', 8, '💧', '#3b82f6')
    RETURNING id INTO test_habit_id;

    -- Add habit logs (last 5 days)
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES
        (test_habit_id, test_user_id, CURRENT_DATE - 4, 6, 'Did okay'),
        (test_habit_id, test_user_id, CURRENT_DATE - 3, 8, 'Hit target!'),
        (test_habit_id, test_user_id, CURRENT_DATE - 2, 7, 'Almost there'),
        (test_habit_id, test_user_id, CURRENT_DATE - 1, 8, 'Perfect day'),
        (test_habit_id, test_user_id, CURRENT_DATE, 5, 'Still working on it');

    -- Add notifications
    INSERT INTO notifications (user_id, type, title, message, priority, read)
    VALUES
        (test_user_id, 'shift', 'Shift Reminder', 'Your shift starts in 2 hours', 'high', false),
        (test_user_id, 'wellness', 'Wellness Check', 'Don''t forget to log your mood today!', 'normal', false),
        (test_user_id, 'task', 'Task Due Soon', 'Call mom - due tomorrow', 'normal', true);

    -- Initialize wellness points
    INSERT INTO wellness_points (user_id, points, daily_streak, last_activity_date, total_moods_logged, total_sleep_logged, total_habits_completed)
    VALUES (test_user_id, 150, 7, CURRENT_DATE, 7, 7, 5)
    ON CONFLICT (user_id) DO UPDATE SET
        points = 150,
        daily_streak = 7,
        total_moods_logged = 7,
        total_sleep_logged = 7,
        total_habits_completed = 5;

    -- Award first badge
    INSERT INTO user_badges (user_id, badge_id)
    SELECT test_user_id, id FROM badges WHERE name = 'Early Bird'
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Test data added successfully!';
END $$;

-- ============================================================================
-- VERIFICATION: Check what was created
-- ============================================================================

SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('circles', 'shifts', 'personal_tasks', 'mood_logs', 'sleep_logs', 'habits', 'notifications', 'badges', 'wellness_points')
ORDER BY table_name;

SELECT 'Sample data counts:' as status;
SELECT 
    (SELECT COUNT(*) FROM shifts WHERE user_id = auth.uid()) as shifts,
    (SELECT COUNT(*) FROM personal_tasks WHERE user_id = auth.uid()) as tasks,
    (SELECT COUNT(*) FROM mood_logs WHERE user_id = auth.uid()) as mood_logs,
    (SELECT COUNT(*) FROM sleep_logs WHERE user_id = auth.uid()) as sleep_logs,
    (SELECT COUNT(*) FROM badges) as total_badges,
    (SELECT COUNT(*) FROM user_badges WHERE user_id = auth.uid()) as earned_badges;
