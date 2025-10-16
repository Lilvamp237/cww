-- DUMMY DATA FOR ZEN-ONCALL SYSTEM
-- This script creates test users, circles, shifts, tasks, habits, and more
-- Run this in your Supabase SQL Editor after setting up the schema

-- Note: In a real Supabase setup, users are created through the auth system
-- This script assumes you have at least one authenticated user
-- Replace the UUIDs below with actual user IDs from your auth.users table if needed

-- ==================================================================
-- STEP 1: Get your current user ID and create test profiles
-- ==================================================================

-- First, let's create some helper variables (you'll need to replace these with real user IDs)
DO $$
DECLARE
    current_user_id UUID;
    test_user_2 UUID := '22222222-2222-2222-2222-222222222222'::UUID;
    test_user_3 UUID := '33333333-3333-3333-3333-333333333333'::UUID;
    test_user_4 UUID := '44444444-4444-4444-4444-444444444444'::UUID;
    
    circle_1_id BIGINT;
    circle_2_id BIGINT;
    
    shift_1_id BIGINT;
    shift_2_id BIGINT;
    shift_3_id BIGINT;
    shift_4_id BIGINT;
    
    habit_1_id BIGINT;
    habit_2_id BIGINT;
    habit_3_id BIGINT;
BEGIN
    -- Get the current authenticated user
    current_user_id := auth.uid();
    
    -- If no user is authenticated, we'll use a placeholder
    IF current_user_id IS NULL THEN
        current_user_id := '11111111-1111-1111-1111-111111111111'::UUID;
        RAISE NOTICE 'No authenticated user found. Using placeholder ID: %', current_user_id;
    ELSE
        RAISE NOTICE 'Current user ID: %', current_user_id;
    END IF;

    -- ==================================================================
    -- STEP 2: Create test profiles (if they don't exist)
    -- ==================================================================
    
    -- First, ensure avatar_url column exists in profiles table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to profiles table';
    END IF;
    
    INSERT INTO profiles (id, full_name, avatar_url)
    VALUES 
        (current_user_id, 'Dr. Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
        (test_user_2, 'Dr. Michael Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),
        (test_user_3, 'Dr. Emily Rodriguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'),
        (test_user_4, 'Dr. James Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James')
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url;

    -- ==================================================================
    -- STEP 3: Create test circles
    -- ==================================================================
    
    INSERT INTO circles (name, description, created_by)
    VALUES 
        ('Emergency Department Team', 'ER doctors and nurses coordinating on-call schedules', current_user_id),
        ('ICU Night Shift', 'Intensive Care Unit night shift coordination', current_user_id)
    RETURNING id INTO circle_1_id;
    
    -- Get the second circle ID
    SELECT id INTO circle_2_id FROM circles WHERE name = 'ICU Night Shift';

    RAISE NOTICE 'Created circles: % and %', circle_1_id, circle_2_id;

    -- ==================================================================
    -- STEP 4: Add members to circles
    -- ==================================================================
    
    -- Emergency Department Team members
    INSERT INTO circle_members (circle_id, user_id, role, share_shifts, share_status)
    VALUES 
        (circle_1_id, current_user_id, 'admin', TRUE, TRUE),
        (circle_1_id, test_user_2, 'member', TRUE, TRUE),
        (circle_1_id, test_user_3, 'member', TRUE, TRUE)
    ON CONFLICT (circle_id, user_id) DO NOTHING;
    
    -- ICU Night Shift members
    INSERT INTO circle_members (circle_id, user_id, role, share_shifts, share_status)
    VALUES 
        (circle_2_id, current_user_id, 'admin', TRUE, TRUE),
        (circle_2_id, test_user_3, 'member', TRUE, TRUE),
        (circle_2_id, test_user_4, 'member', TRUE, TRUE)
    ON CONFLICT (circle_id, user_id) DO NOTHING;

    -- ==================================================================
    -- STEP 5: Create shifts for different users
    -- ==================================================================
    
    -- Current user's shifts
    INSERT INTO shifts (user_id, circle_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (current_user_id, circle_1_id, 'ER Night Shift', 
         NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '12 hours',
         'work', '#ef4444', 'Emergency room coverage - bring extra coffee!'),
        
        (current_user_id, circle_1_id, 'Morning Rounds', 
         NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
         'work', '#3b82f6', 'Patient rounds and consults'),
        
        (current_user_id, NULL, 'Gym Session', 
         NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1 hour',
         'personal', '#10b981', 'Personal wellness time'),
        
        (current_user_id, NULL, 'Dinner with Family', 
         NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '2 hours',
         'personal', '#f59e0b', 'Quality time with loved ones')
    RETURNING id INTO shift_1_id;
    
    -- Test user 2's shifts
    INSERT INTO shifts (user_id, circle_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (test_user_2, circle_1_id, 'ER Day Shift', 
         NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '8 hours',
         'work', '#3b82f6', 'Day coverage for emergency department'),
        
        (test_user_2, circle_1_id, 'On-Call Weekend', 
         NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '48 hours',
         'work', '#8b5cf6', 'Weekend on-call duty')
    RETURNING id INTO shift_2_id;
    
    -- Test user 3's shifts
    INSERT INTO shifts (user_id, circle_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (test_user_3, circle_2_id, 'ICU Night Coverage', 
         NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '12 hours',
         'work', '#dc2626', 'Critical care overnight shift'),
        
        (test_user_3, circle_1_id, 'ER Backup', 
         NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days' + INTERVAL '6 hours',
         'work', '#f59e0b', 'Emergency backup coverage')
    RETURNING id INTO shift_3_id;
    
    -- Test user 4's shifts
    INSERT INTO shifts (user_id, circle_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (test_user_4, circle_2_id, 'ICU Day Shift', 
         NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '10 hours',
         'work', '#0ea5e9', 'Intensive care daytime coverage')
    RETURNING id INTO shift_4_id;

    -- ==================================================================
    -- STEP 6: Create personal tasks for the current user
    -- ==================================================================
    
    INSERT INTO personal_tasks (user_id, title, description, due_date, due_time, priority, category, completed)
    VALUES 
        (current_user_id, 'Complete medical charts', 'Finish pending patient documentation', 
         CURRENT_DATE + INTERVAL '1 day', '14:00', 'high', 'personal', FALSE),
        
        (current_user_id, 'Grocery shopping', 'Buy healthy snacks and meal prep ingredients', 
         CURRENT_DATE + INTERVAL '2 days', '18:00', 'medium', 'errand', FALSE),
        
        (current_user_id, 'Team meeting prep', 'Prepare slides for department presentation', 
         CURRENT_DATE + INTERVAL '3 days', '10:00', 'high', 'personal', FALSE),
        
        (current_user_id, 'Call insurance company', 'Follow up on claim from last month', 
         CURRENT_DATE + INTERVAL '1 day', '15:30', 'medium', 'errand', FALSE),
        
        (current_user_id, 'Pack lunch for tomorrow', 'Healthy meal prep for night shift', 
         CURRENT_DATE, '20:00', 'medium', 'meal', FALSE),
        
        (current_user_id, 'Review medical journals', 'Catch up on latest research articles', 
         CURRENT_DATE + INTERVAL '4 days', NULL, 'low', 'personal', FALSE),
        
        (current_user_id, 'Schedule dentist appointment', 'Routine check-up overdue', 
         CURRENT_DATE + INTERVAL '5 days', NULL, 'low', 'errand', FALSE),
        
        (current_user_id, 'Completed task example', 'This was finished yesterday', 
         CURRENT_DATE - INTERVAL '1 day', '12:00', 'high', 'personal', TRUE);

    -- ==================================================================
    -- STEP 7: Create habits for the current user
    -- ==================================================================
    
    INSERT INTO habits (user_id, name, description, frequency, target_count, icon, color, active)
    VALUES 
        (current_user_id, 'Drink Water', '8 glasses per day to stay hydrated', 'daily', 8, '💧', '#0ea5e9', TRUE),
        (current_user_id, 'Exercise', '30 minutes of physical activity', 'daily', 1, '🏃', '#10b981', TRUE),
        (current_user_id, 'Meditation', 'Mindfulness practice for mental health', 'daily', 1, '🧘', '#8b5cf6', TRUE),
        (current_user_id, 'Read Medical Journals', 'Stay updated with latest research', 'weekly', 3, '📚', '#f59e0b', TRUE),
        (current_user_id, 'Sleep 7+ hours', 'Adequate rest for optimal performance', 'daily', 1, '😴', '#6366f1', TRUE)
    RETURNING id INTO habit_1_id;
    
    -- Get habit IDs
    SELECT id INTO habit_2_id FROM habits WHERE user_id = current_user_id AND name = 'Exercise';
    SELECT id INTO habit_3_id FROM habits WHERE user_id = current_user_id AND name = 'Meditation';

    -- ==================================================================
    -- STEP 8: Create habit logs (tracking data for the past week)
    -- ==================================================================
    
    -- Water intake logs
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES 
        (habit_1_id, current_user_id, CURRENT_DATE, 6, 'Good progress today'),
        (habit_1_id, current_user_id, CURRENT_DATE - 1, 8, 'Hit the target!'),
        (habit_1_id, current_user_id, CURRENT_DATE - 2, 5, 'Need to drink more'),
        (habit_1_id, current_user_id, CURRENT_DATE - 3, 7, 'Almost there'),
        (habit_1_id, current_user_id, CURRENT_DATE - 4, 8, 'Perfect day'),
        (habit_1_id, current_user_id, CURRENT_DATE - 5, 4, 'Very busy shift'),
        (habit_1_id, current_user_id, CURRENT_DATE - 6, 6, 'Decent effort');
    
    -- Exercise logs
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES 
        (habit_2_id, current_user_id, CURRENT_DATE, 1, 'Morning run - 3 miles'),
        (habit_2_id, current_user_id, CURRENT_DATE - 2, 1, 'Gym session'),
        (habit_2_id, current_user_id, CURRENT_DATE - 4, 1, 'Yoga class'),
        (habit_2_id, current_user_id, CURRENT_DATE - 6, 1, 'Quick workout');
    
    -- Meditation logs
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES 
        (habit_3_id, current_user_id, CURRENT_DATE, 1, '15 minutes before shift'),
        (habit_3_id, current_user_id, CURRENT_DATE - 1, 1, 'Evening meditation'),
        (habit_3_id, current_user_id, CURRENT_DATE - 3, 1, 'Stress relief session'),
        (habit_3_id, current_user_id, CURRENT_DATE - 5, 1, 'Morning practice');

    -- ==================================================================
    -- STEP 9: Create circle announcements
    -- ==================================================================
    
    INSERT INTO circle_announcements (circle_id, author_id, title, content, priority)
    VALUES 
        (circle_1_id, current_user_id, 'Schedule Change Next Week',
         'Please note that we have adjusted the on-call rotation for next week due to the hospital conference. Check your updated shifts!',
         'high'),
        
        (circle_1_id, test_user_2, 'New Protocol for COVID Patients',
         'Updated guidelines have been issued for handling COVID-19 cases in the ER. Please review the attached documentation in your email.',
         'urgent'),
        
        (circle_1_id, current_user_id, 'Team Lunch This Friday',
         'Join us for a team lunch this Friday at 1 PM in the cafeteria. It would be great to catch up with everyone!',
         'normal'),
        
        (circle_2_id, test_user_3, 'ICU Equipment Maintenance',
         'The ventilators in rooms 3 and 5 will undergo maintenance this weekend. Patients will be temporarily relocated.',
         'high'),
        
        (circle_2_id, current_user_id, 'Great Work Team!',
         'Excellent patient outcomes this month. Your dedication to critical care is making a real difference. Keep up the amazing work!',
         'normal');

    -- ==================================================================
    -- STEP 10: Create shift swap requests
    -- ==================================================================
    
    INSERT INTO shift_swaps (circle_id, requester_id, requester_shift_id, target_user_id, target_shift_id, status, message, response_message)
    VALUES 
        (circle_1_id, test_user_2, shift_2_id, current_user_id, shift_1_id, 
         'pending', 
         'Hey, I have a family emergency this weekend. Could we possibly swap shifts? I can take your night shift next week in exchange.',
         NULL),
        
        (circle_1_id, current_user_id, shift_1_id, test_user_3, shift_3_id, 
         'accepted', 
         'Would you be able to cover my ER shift? I can take your ICU shift in return.',
         'Sure, no problem! I can cover that for you.'),
        
        (circle_2_id, test_user_3, shift_3_id, test_user_4, shift_4_id, 
         'declined', 
         'Can we swap? I have a conference to attend.',
         'Sorry, I already have commitments that day. Maybe ask someone else?');

    -- ==================================================================
    -- STEP 11: Create wellness check-ins (if you have a wellness table)
    -- ==================================================================
    
    -- Note: Add wellness data if your schema includes it
    -- This is optional based on your actual schema

    RAISE NOTICE 'Dummy data inserted successfully!';
    RAISE NOTICE 'Circles created: %, %', circle_1_id, circle_2_id;
    RAISE NOTICE 'Check your application to see the test data in action!';

END $$;

-- ==================================================================
-- VERIFICATION QUERIES - Run these to see what was created
-- ==================================================================

-- Show all circles and their members
SELECT 
    c.id,
    c.name,
    c.description,
    COUNT(cm.user_id) as member_count
FROM circles c
LEFT JOIN circle_members cm ON c.id = cm.circle_id
GROUP BY c.id, c.name, c.description
ORDER BY c.created_at DESC;

-- Show all shifts
SELECT 
    s.id,
    p.full_name as user_name,
    s.title,
    s.start_time,
    s.end_time,
    s.category,
    c.name as circle_name
FROM shifts s
JOIN profiles p ON s.user_id = p.id
LEFT JOIN circles c ON s.circle_id = c.id
ORDER BY s.start_time;

-- Show personal tasks
SELECT 
    pt.id,
    p.full_name as user_name,
    pt.title,
    pt.due_date,
    pt.priority,
    pt.category,
    pt.completed
FROM personal_tasks pt
JOIN profiles p ON pt.user_id = p.id
ORDER BY pt.due_date;

-- Show habits and their tracking
SELECT 
    h.name as habit_name,
    h.frequency,
    h.target_count,
    COUNT(hl.id) as logs_count,
    AVG(hl.count) as avg_completion
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id
GROUP BY h.id, h.name, h.frequency, h.target_count
ORDER BY h.name;

-- Show announcements
SELECT 
    ca.id,
    c.name as circle_name,
    p.full_name as author_name,
    ca.title,
    ca.priority,
    ca.created_at
FROM circle_announcements ca
JOIN circles c ON ca.circle_id = c.id
JOIN profiles p ON ca.author_id = p.id
ORDER BY ca.created_at DESC;

-- Show shift swaps
SELECT 
    ss.id,
    c.name as circle_name,
    p1.full_name as requester_name,
    p2.full_name as target_name,
    ss.status,
    ss.message,
    ss.created_at
FROM shift_swaps ss
JOIN circles c ON ss.circle_id = c.id
JOIN profiles p1 ON ss.requester_id = p1.id
LEFT JOIN profiles p2 ON ss.target_user_id = p2.id
ORDER BY ss.created_at DESC;

-- Show summary statistics
SELECT 
    'Total Circles' as metric, 
    COUNT(*)::TEXT as value 
FROM circles
UNION ALL
SELECT 'Total Circle Members', COUNT(*)::TEXT FROM circle_members
UNION ALL
SELECT 'Total Shifts', COUNT(*)::TEXT FROM shifts
UNION ALL
SELECT 'Total Tasks', COUNT(*)::TEXT FROM personal_tasks
UNION ALL
SELECT 'Total Habits', COUNT(*)::TEXT FROM habits
UNION ALL
SELECT 'Total Habit Logs', COUNT(*)::TEXT FROM habit_logs
UNION ALL
SELECT 'Total Announcements', COUNT(*)::TEXT FROM circle_announcements
UNION ALL
SELECT 'Total Shift Swaps', COUNT(*)::TEXT FROM shift_swaps;
