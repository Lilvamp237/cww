-- MULTI-USER DUMMY DATA FOR CARESYNC
-- Creates realistic team data for all 4 users with interactions!

DO $$
DECLARE
    -- Your 4 user IDs
    user_1 UUID := '5614df0a-5d61-4a3b-b68f-85ad5d75c08f'::UUID;
    user_2 UUID := '33f7ecd3-a97e-4a3c-a543-b79ef104bc6b'::UUID;
    user_3 UUID := '03e3b097-6bcb-4bd7-bad9-60f4769563fe'::UUID;
    user_4 UUID := '10eabe70-4d2c-4751-8e51-a3c95c6c941b'::UUID;
    
    user_1_email TEXT;
    user_2_email TEXT;
    user_3_email TEXT;
    user_4_email TEXT;
    
    circle_1_id BIGINT;
    circle_2_id BIGINT;
    
    habit_1_id BIGINT;
    habit_2_id BIGINT;
    habit_3_id BIGINT;
    
    shift_user1_er BIGINT;
    shift_user2_oncall BIGINT;
    shift_user3_icu BIGINT;
BEGIN
    -- ==================================================================
    -- Get user emails
    -- ==================================================================
    
    SELECT email INTO user_1_email FROM auth.users WHERE id = user_1;
    SELECT email INTO user_2_email FROM auth.users WHERE id = user_2;
    SELECT email INTO user_3_email FROM auth.users WHERE id = user_3;
    SELECT email INTO user_4_email FROM auth.users WHERE id = user_4;
    
    RAISE NOTICE '✓ Found 4 users:';
    RAISE NOTICE '  User 1: %', user_1_email;
    RAISE NOTICE '  User 2: %', user_2_email;
    RAISE NOTICE '  User 3: %', user_3_email;
    RAISE NOTICE '  User 4: %', user_4_email;

    -- ==================================================================
    -- Add avatar_url column if needed
    -- ==================================================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '✓ Added avatar_url column to profiles table';
    END IF;
    
    -- ==================================================================
    -- Create profiles for all 4 users
    -- ==================================================================
    
    INSERT INTO profiles (id, full_name, avatar_url)
    VALUES 
        (user_1, 'Dr. Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
        (user_2, 'Dr. Michael Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),
        (user_3, 'Dr. Emily Rodriguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'),
        (user_4, 'Dr. James Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James')
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url;

    RAISE NOTICE '✓ Created/updated profiles for all 4 users';

    -- ==================================================================
    -- Create 2 circles
    -- ==================================================================
    
    -- Delete existing circles with these names to avoid conflicts
    DELETE FROM circles WHERE name IN ('Emergency Department Team', 'ICU Night Shift');
    
    -- Generate unique invite codes (simple random strings)
    INSERT INTO circles (name, invite_code, created_by)
    VALUES 
        ('Emergency Department Team', 'ER-' || substr(md5(random()::text), 1, 8), user_1),
        ('ICU Night Shift', 'ICU-' || substr(md5(random()::text), 1, 8), user_1);
    
    SELECT id INTO circle_1_id FROM circles WHERE name = 'Emergency Department Team' LIMIT 1;
    SELECT id INTO circle_2_id FROM circles WHERE name = 'ICU Night Shift' LIMIT 1;

    RAISE NOTICE '✓ Created circles: Emergency Dept (ID: %) and ICU (ID: %)', circle_1_id, circle_2_id;

    -- ==================================================================
    -- Add all users to circles
    -- ==================================================================
    
    -- Emergency Department Team: All 4 users
    INSERT INTO circle_members (circle_id, user_id, share_shifts, share_status)
    VALUES 
        (circle_1_id, user_1, TRUE, TRUE),
        (circle_1_id, user_2, TRUE, TRUE),
        (circle_1_id, user_3, TRUE, TRUE),
        (circle_1_id, user_4, TRUE, FALSE)  -- User 4 keeps status private
    ON CONFLICT (circle_id, user_id) DO NOTHING;
    
    -- ICU Night Shift: Users 1, 3, and 4
    INSERT INTO circle_members (circle_id, user_id, share_shifts, share_status)
    VALUES 
        (circle_2_id, user_1, TRUE, TRUE),
        (circle_2_id, user_3, TRUE, TRUE),
        (circle_2_id, user_4, TRUE, TRUE)
    ON CONFLICT (circle_id, user_id) DO NOTHING;

    RAISE NOTICE '✓ Added all users to appropriate circles';

    -- ==================================================================
    -- Create shifts for ALL users
    -- ==================================================================
    
    -- USER 1 (Dr. Sarah Johnson) - Shifts
    INSERT INTO shifts (user_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (user_1, 'ER Night Shift', 
         NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '12 hours',
         'work', '#ef4444', 'Emergency room coverage'),
        
        (user_1, 'Morning Rounds', 
         NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '4 hours',
         'work', '#3b82f6', 'Patient rounds and consults'),
        
        (user_1, 'ICU Night Coverage', 
         NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '12 hours',
         'work', '#dc2626', 'Critical care overnight'),
        
        (user_1, 'Yoga Class', 
         NOW() + INTERVAL '2 days' + INTERVAL '7 hours', NOW() + INTERVAL '2 days' + INTERVAL '8 hours',
         'personal', '#a855f7', 'Morning yoga');
    
    -- USER 2 (Dr. Michael Chen) - Shifts
    INSERT INTO shifts (user_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (user_2, 'ER Day Shift', 
         NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '8 hours',
         'work', '#3b82f6', 'Day coverage for emergency'),
        
        (user_2, 'On-Call Weekend', 
         NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days' + INTERVAL '48 hours',
         'work', '#8b5cf6', 'Weekend on-call duty'),
        
        (user_2, 'Basketball Game', 
         NOW() + INTERVAL '4 days' + INTERVAL '18 hours', NOW() + INTERVAL '4 days' + INTERVAL '20 hours',
         'personal', '#10b981', 'Playing with friends');
    
    -- USER 3 (Dr. Emily Rodriguez) - Shifts
    INSERT INTO shifts (user_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (user_3, 'ICU Day Shift', 
         NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
         'work', '#0ea5e9', 'ICU daytime coverage'),
        
        (user_3, 'ER Backup', 
         NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '6 hours',
         'work', '#f59e0b', 'Emergency backup'),
        
        (user_3, 'ICU Night', 
         NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '12 hours',
         'work', '#dc2626', 'Night shift ICU'),
        
        (user_3, 'Book Club', 
         NOW() + INTERVAL '3 days' + INTERVAL '19 hours', NOW() + INTERVAL '3 days' + INTERVAL '21 hours',
         'personal', '#ec4899', 'Monthly book discussion');
    
    -- USER 4 (Dr. James Wilson) - Shifts
    INSERT INTO shifts (user_id, title, start_time, end_time, category, color, notes)
    VALUES 
        (user_4, 'ICU Weekend', 
         NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '24 hours',
         'work', '#8b5cf6', 'Weekend ICU duty'),
        
        (user_4, 'ER Evening', 
         NOW() + INTERVAL '2 days' + INTERVAL '16 hours', NOW() + INTERVAL '2 days' + INTERVAL '24 hours',
         'work', '#ef4444', 'Evening ER coverage'),
        
        (user_4, 'Guitar Practice', 
         NOW() + INTERVAL '1 day' + INTERVAL '20 hours', NOW() + INTERVAL '1 day' + INTERVAL '21 hours',
         'personal', '#f59e0b', 'Band rehearsal');

    RAISE NOTICE '✓ Created shifts for all 4 users (15 total shifts)';

    -- ==================================================================
    -- Create tasks for USER 1 only (to keep it manageable)
    -- ==================================================================
    
    INSERT INTO personal_tasks (user_id, title, description, due_date, due_time, priority, category, completed)
    VALUES 
        (user_1, 'Complete medical charts', 'Finish pending patient documentation', 
         CURRENT_DATE + INTERVAL '1 day', '14:00', 'high', 'personal', FALSE),
        
        (user_1, 'Grocery shopping', 'Buy healthy snacks and meal prep ingredients', 
         CURRENT_DATE + INTERVAL '2 days', '18:00', 'medium', 'errand', FALSE),
        
        (user_1, 'Team meeting prep', 'Prepare slides for department presentation', 
         CURRENT_DATE + INTERVAL '3 days', '10:00', 'high', 'personal', FALSE),
        
        (user_1, 'Review medical journals', 'Catch up on latest research', 
         CURRENT_DATE + INTERVAL '4 days', NULL, 'low', 'personal', FALSE),
        
        (user_1, 'Completed: Updated certifications', 'Renewed CPR certification', 
         CURRENT_DATE - INTERVAL '1 day', '12:00', 'high', 'personal', TRUE);

    RAISE NOTICE '✓ Created 5 personal tasks for User 1';

    -- ==================================================================
    -- Create habits for USER 1
    -- ==================================================================
    
    INSERT INTO habits (user_id, name, description, frequency, target_count, icon, color, active)
    VALUES 
        (user_1, 'Drink Water', '8 glasses per day to stay hydrated', 'daily', 8, '💧', '#0ea5e9', TRUE),
        (user_1, 'Exercise', '30 minutes of physical activity', 'daily', 1, '🏃', '#10b981', TRUE),
        (user_1, 'Meditation', 'Mindfulness practice', 'daily', 1, '🧘', '#8b5cf6', TRUE);
    
    SELECT id INTO habit_1_id FROM habits WHERE user_id = user_1 AND name = 'Drink Water' LIMIT 1;
    SELECT id INTO habit_2_id FROM habits WHERE user_id = user_1 AND name = 'Exercise' LIMIT 1;
    SELECT id INTO habit_3_id FROM habits WHERE user_id = user_1 AND name = 'Meditation' LIMIT 1;

    -- Create habit logs (past week)
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES 
        -- Water
        (habit_1_id, user_1, CURRENT_DATE, 6, 'Good progress'),
        (habit_1_id, user_1, CURRENT_DATE - 1, 8, 'Hit target! 🎉'),
        (habit_1_id, user_1, CURRENT_DATE - 2, 7, 'Almost there'),
        (habit_1_id, user_1, CURRENT_DATE - 3, 5, 'Busy day'),
        (habit_1_id, user_1, CURRENT_DATE - 4, 8, 'Perfect!'),
        -- Exercise
        (habit_2_id, user_1, CURRENT_DATE, 1, 'Morning run'),
        (habit_2_id, user_1, CURRENT_DATE - 2, 1, 'Gym session'),
        (habit_2_id, user_1, CURRENT_DATE - 4, 1, 'Yoga class'),
        -- Meditation
        (habit_3_id, user_1, CURRENT_DATE, 1, '15 min session'),
        (habit_3_id, user_1, CURRENT_DATE - 1, 1, 'Evening practice'),
        (habit_3_id, user_1, CURRENT_DATE - 3, 1, 'Stress relief');

    RAISE NOTICE '✓ Created 3 habits with tracking logs for User 1';

    -- ==================================================================
    -- Create circle announcements from different users
    -- ==================================================================
    
    INSERT INTO circle_announcements (circle_id, author_id, title, content, priority)
    VALUES 
        (circle_1_id, user_1, 'Welcome to Emergency Department Team!',
         'Thanks for joining! Use this space to coordinate schedules and share updates.',
         'normal'),
        
        (circle_1_id, user_2, 'Schedule Changes Next Week',
         'FYI - I adjusted my weekend shifts. Please check if this affects anyone.',
         'high'),
        
        (circle_1_id, user_1, 'New COVID-19 Protocol',
         'Updated guidelines issued. Training session Thursday at 2 PM.',
         'urgent'),
        
        (circle_2_id, user_3, 'ICU Equipment Maintenance',
         'Ventilators in rooms 3 and 5 will be serviced this weekend (Sat 9 AM - 5 PM).',
         'high'),
        
        (circle_2_id, user_1, 'Great Work Team!',
         'Excellent patient outcomes this month. Your dedication is making a difference!',
         'normal'),
        
        (circle_1_id, user_4, 'Coffee Run?',
         'Anyone want coffee before the evening shift? Meeting at cafe at 3:30 PM.',
         'normal');

    RAISE NOTICE '✓ Created 6 announcements from different users';

    -- ==================================================================
    -- Create shift swap requests between users
    -- ==================================================================
    
    -- Get some shift IDs to use in swap requests
    SELECT id INTO shift_user1_er FROM shifts WHERE user_id = user_1 AND title LIKE '%ER%' LIMIT 1;
    SELECT id INTO shift_user2_oncall FROM shifts WHERE user_id = user_2 AND title LIKE '%On-Call%' LIMIT 1;
    SELECT id INTO shift_user3_icu FROM shifts WHERE user_id = user_3 AND title LIKE '%ICU%' LIMIT 1;
    
    -- Only create swaps if we found the shifts
    IF shift_user1_er IS NOT NULL AND shift_user2_oncall IS NOT NULL AND shift_user3_icu IS NOT NULL THEN
        INSERT INTO shift_swaps (circle_id, requester_id, requester_shift_id, target_user_id, target_shift_id, status, message, response_message)
        VALUES 
            (circle_1_id, user_2, shift_user2_oncall, user_1, shift_user1_er, 
             'pending', 
             'Hey Sarah! I have a family emergency this weekend. Could we swap shifts? I can take your night shift next week.',
             NULL),
            
            (circle_1_id, user_1, shift_user1_er, user_3, shift_user3_icu, 
             'accepted', 
             'Emily, can you cover my ER shift? I can take your ICU shift in return.',
             'Sure Sarah! No problem, I can cover that for you.'),
            
            (circle_2_id, user_3, shift_user3_icu, user_4, NULL, 
             'declined', 
             'James, can anyone cover my ICU night shift? I have a conference.',
             'Sorry Emily, I already have commitments. Maybe try Michael?');
        
        RAISE NOTICE '✓ Created 3 shift swap requests';
    ELSE
        RAISE NOTICE '⚠ Skipped shift swaps - some shifts not found';
    END IF;

    RAISE NOTICE '✓ Created 3 shift swap requests (pending, accepted, declined)';

    -- ==================================================================
    -- SUCCESS!
    -- ==================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '✓✓✓ MULTI-USER DUMMY DATA INSERTED SUCCESSFULLY! ✓✓✓';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Created for 4 users:';
    RAISE NOTICE '  • Dr. Sarah Johnson (%)   - Admin', user_1_email;
    RAISE NOTICE '  • Dr. Michael Chen (%)    - Member', user_2_email;
    RAISE NOTICE '  • Dr. Emily Rodriguez (%) - Member', user_3_email;
    RAISE NOTICE '  • Dr. James Wilson (%)    - Member', user_4_email;
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  • 4 user profiles with avatars';
    RAISE NOTICE '  • 2 circles (Emergency Dept + ICU)';
    RAISE NOTICE '  • 15 shifts across all users';
    RAISE NOTICE '  • 5 tasks (for User 1)';
    RAISE NOTICE '  • 3 habits with logs (for User 1)';
    RAISE NOTICE '  • 6 announcements from different users';
    RAISE NOTICE '  • 3 shift swap requests';
    RAISE NOTICE '';
    RAISE NOTICE 'Circle membership:';
    RAISE NOTICE '  • Emergency Dept: All 4 users';
    RAISE NOTICE '  • ICU Night Shift: Users 1, 3, 4';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Log in as any user and explore the data!';
    RAISE NOTICE '════════════════════════════════════════════════════════════';

END $$;

-- ==================================================================
-- VERIFICATION QUERIES
-- ==================================================================

-- Show all users and their profiles
SELECT 
    '=== ALL USERS ===' as info,
    u.id,
    u.email,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at;

-- Show circles and member count
SELECT 
    '=== CIRCLES ===' as info,
    c.name,
    COUNT(cm.user_id) as members
FROM circles c
LEFT JOIN circle_members cm ON c.id = cm.circle_id
GROUP BY c.id, c.name;

-- Show all shifts by user
SELECT 
    '=== ALL SHIFTS ===' as info,
    p.full_name,
    s.title,
    s.start_time::date as date,
    s.category,
    s.color
FROM shifts s
JOIN profiles p ON s.user_id = p.id
ORDER BY s.start_time;

-- Show announcements
SELECT 
    '=== ANNOUNCEMENTS ===' as info,
    p.full_name as author,
    ci.name as circle,
    ca.title,
    ca.priority
FROM circle_announcements ca
JOIN profiles p ON ca.author_id = p.id
JOIN circles ci ON ca.circle_id = ci.id
ORDER BY ca.created_at DESC;

-- Show shift swaps
SELECT 
    '=== SHIFT SWAPS ===' as info,
    p1.full_name as requester,
    p2.full_name as target,
    ss.status,
    ss.message
FROM shift_swaps ss
JOIN profiles p1 ON ss.requester_id = p1.id
LEFT JOIN profiles p2 ON ss.target_user_id = p2.id
ORDER BY ss.created_at DESC;
