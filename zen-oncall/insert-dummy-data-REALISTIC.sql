-- REALISTIC DUMMY DATA FOR ZEN-ONCALL SYSTEM
-- This version works with YOUR actual authenticated user (no fake users!)
-- Run this while logged into the application

-- ==================================================================
-- IMPORTANT: You must be logged in for this to work!
-- The script uses auth.uid() to get your current user ID
-- ==================================================================

DO $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
    
    circle_1_id BIGINT;
    circle_2_id BIGINT;
    
    shift_1_id BIGINT;
    shift_2_id BIGINT;
    
    habit_1_id BIGINT;
    habit_2_id BIGINT;
    habit_3_id BIGINT;
BEGIN
    -- ==================================================================
    -- STEP 1: Get the current authenticated user
    -- ==================================================================
    
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found! Please log in to the application first, then run this script.';
    END IF;

    -- Get user email
    SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    
    RAISE NOTICE '✓ Running script for user: % (ID: %)', current_user_email, current_user_id;

    -- ==================================================================
    -- STEP 2: Ensure your profile exists with avatar
    -- ==================================================================
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '✓ Added avatar_url column to profiles table';
    END IF;
    
    -- Update or create your profile
    INSERT INTO profiles (id, full_name, avatar_url)
    VALUES (
        current_user_id, 
        COALESCE((SELECT full_name FROM profiles WHERE id = current_user_id), 'Dr. ' || split_part(current_user_email, '@', 1)),
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || current_user_email
    )
    ON CONFLICT (id) DO UPDATE
    SET avatar_url = EXCLUDED.avatar_url;

    RAISE NOTICE '✓ Profile updated with avatar';

    -- ==================================================================
    -- STEP 3: Create test circles
    -- ==================================================================
    
    INSERT INTO circles (name, description, created_by)
    VALUES 
        ('Emergency Department Team', 'ER doctors and nurses coordinating on-call schedules', current_user_id),
        ('ICU Night Shift', 'Intensive Care Unit night shift coordination', current_user_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO circle_1_id;
    
    -- Get circle IDs (in case they already exist)
    SELECT id INTO circle_1_id FROM circles WHERE name = 'Emergency Department Team' AND created_by = current_user_id LIMIT 1;
    SELECT id INTO circle_2_id FROM circles WHERE name = 'ICU Night Shift' AND created_by = current_user_id LIMIT 1;

    IF circle_1_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create circles. This might mean circles with these names already exist.';
    END IF;

    RAISE NOTICE '✓ Created circles: Emergency Dept (%) and ICU (%)', circle_1_id, circle_2_id;

    -- ==================================================================
    -- STEP 4: Add yourself as admin to both circles
    -- ==================================================================
    
    INSERT INTO circle_members (circle_id, user_id, role, share_shifts, share_status)
    VALUES 
        (circle_1_id, current_user_id, 'admin', TRUE, TRUE),
        (circle_2_id, current_user_id, 'admin', TRUE, TRUE)
    ON CONFLICT (circle_id, user_id) DO NOTHING;

    RAISE NOTICE '✓ Added you as admin to both circles';

    -- ==================================================================
    -- STEP 5: Create diverse shifts for YOU
    -- ==================================================================
    
    INSERT INTO shifts (user_id, circle_id, title, start_time, end_time, category, color, notes)
    VALUES 
        -- Emergency Department shifts
        (current_user_id, circle_1_id, 'ER Night Shift', 
         NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '12 hours',
         'work', '#ef4444', 'Emergency room coverage - bring extra coffee!'),
        
        (current_user_id, circle_1_id, 'Morning Rounds', 
         NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '4 hours',
         'work', '#3b82f6', 'Patient rounds and consults'),
        
        (current_user_id, circle_1_id, 'ER Day Shift', 
         NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '8 hours',
         'work', '#0ea5e9', 'Daytime emergency coverage'),
        
        -- ICU shifts
        (current_user_id, circle_2_id, 'ICU Night Coverage', 
         NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '12 hours',
         'work', '#dc2626', 'Critical care overnight shift'),
        
        (current_user_id, circle_2_id, 'ICU Weekend On-Call', 
         NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days' + INTERVAL '24 hours',
         'work', '#8b5cf6', 'Weekend ICU coverage'),
        
        -- Personal time (no circle)
        (current_user_id, NULL, 'Gym Session', 
         NOW() + INTERVAL '1 day' + INTERVAL '18 hours', NOW() + INTERVAL '1 day' + INTERVAL '19 hours',
         'personal', '#10b981', 'Personal wellness time'),
        
        (current_user_id, NULL, 'Dinner with Family', 
         NOW() + INTERVAL '2 days' + INTERVAL '19 hours', NOW() + INTERVAL '2 days' + INTERVAL '21 hours',
         'personal', '#f59e0b', 'Quality time with loved ones'),
        
        (current_user_id, NULL, 'Yoga Class', 
         NOW() + INTERVAL '5 days' + INTERVAL '7 hours', NOW() + INTERVAL '5 days' + INTERVAL '8 hours',
         'personal', '#a855f7', 'Morning yoga and meditation'),
        
        (current_user_id, NULL, 'Study Time', 
         NOW() + INTERVAL '3 days' + INTERVAL '20 hours', NOW() + INTERVAL '3 days' + INTERVAL '22 hours',
         'personal', '#06b6d4', 'Review medical journals'),
        
        (current_user_id, NULL, 'Meal Prep Sunday', 
         NOW() + INTERVAL '7 days' + INTERVAL '14 hours', NOW() + INTERVAL '7 days' + INTERVAL '16 hours',
         'personal', '#84cc16', 'Prepare healthy meals for the week');

    RAISE NOTICE '✓ Created 10 shifts (5 work + 5 personal)';

    -- ==================================================================
    -- STEP 6: Create personal tasks
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
        
        (current_user_id, 'Order medical supplies', 'Restock personal medical kit', 
         CURRENT_DATE + INTERVAL '3 days', NULL, 'medium', 'errand', FALSE),
        
        (current_user_id, 'Completed: Updated certifications', 'Renewed CPR certification', 
         CURRENT_DATE - INTERVAL '1 day', '12:00', 'high', 'personal', TRUE),
        
        (current_user_id, 'Completed: Annual physical', 'Completed yearly health checkup', 
         CURRENT_DATE - INTERVAL '3 days', '09:00', 'high', 'personal', TRUE);

    RAISE NOTICE '✓ Created 10 personal tasks (8 pending + 2 completed)';

    -- ==================================================================
    -- STEP 7: Create habits with meaningful goals
    -- ==================================================================
    
    INSERT INTO habits (user_id, name, description, frequency, target_count, icon, color, active)
    VALUES 
        (current_user_id, 'Drink Water', '8 glasses per day to stay hydrated during shifts', 'daily', 8, '💧', '#0ea5e9', TRUE),
        (current_user_id, 'Exercise', '30 minutes of physical activity for fitness', 'daily', 1, '🏃', '#10b981', TRUE),
        (current_user_id, 'Meditation', 'Mindfulness practice for mental health', 'daily', 1, '🧘', '#8b5cf6', TRUE),
        (current_user_id, 'Read Medical Journals', 'Stay updated with latest research', 'weekly', 3, '📚', '#f59e0b', TRUE),
        (current_user_id, 'Sleep 7+ hours', 'Adequate rest for optimal performance', 'daily', 1, '😴', '#6366f1', TRUE)
    RETURNING id INTO habit_1_id;
    
    -- Get habit IDs
    SELECT id INTO habit_2_id FROM habits WHERE user_id = current_user_id AND name = 'Exercise' LIMIT 1;
    SELECT id INTO habit_3_id FROM habits WHERE user_id = current_user_id AND name = 'Meditation' LIMIT 1;

    RAISE NOTICE '✓ Created 5 habits for tracking';

    -- ==================================================================
    -- STEP 8: Create habit logs (past 2 weeks of data)
    -- ==================================================================
    
    -- Water intake logs (14 days)
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES 
        (habit_1_id, current_user_id, CURRENT_DATE, 6, 'Good progress today'),
        (habit_1_id, current_user_id, CURRENT_DATE - 1, 8, 'Hit the target! 🎉'),
        (habit_1_id, current_user_id, CURRENT_DATE - 2, 5, 'Need to drink more'),
        (habit_1_id, current_user_id, CURRENT_DATE - 3, 7, 'Almost there'),
        (habit_1_id, current_user_id, CURRENT_DATE - 4, 8, 'Perfect day'),
        (habit_1_id, current_user_id, CURRENT_DATE - 5, 4, 'Very busy shift'),
        (habit_1_id, current_user_id, CURRENT_DATE - 6, 6, 'Decent effort'),
        (habit_1_id, current_user_id, CURRENT_DATE - 7, 7, 'Doing well'),
        (habit_1_id, current_user_id, CURRENT_DATE - 8, 8, 'Excellent!'),
        (habit_1_id, current_user_id, CURRENT_DATE - 9, 5, 'Forgot a few'),
        (habit_1_id, current_user_id, CURRENT_DATE - 10, 6, 'Getting back on track'),
        (habit_1_id, current_user_id, CURRENT_DATE - 11, 8, 'Full day achieved'),
        (habit_1_id, current_user_id, CURRENT_DATE - 12, 7, 'Solid effort'),
        (habit_1_id, current_user_id, CURRENT_DATE - 13, 6, 'Consistent progress');
    
    -- Exercise logs (10 days, not every day)
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES 
        (habit_2_id, current_user_id, CURRENT_DATE, 1, 'Morning run - 3 miles'),
        (habit_2_id, current_user_id, CURRENT_DATE - 1, 1, 'Evening gym session'),
        (habit_2_id, current_user_id, CURRENT_DATE - 3, 1, 'Yoga class'),
        (habit_2_id, current_user_id, CURRENT_DATE - 4, 1, 'Home workout'),
        (habit_2_id, current_user_id, CURRENT_DATE - 6, 1, 'Swimming'),
        (habit_2_id, current_user_id, CURRENT_DATE - 7, 1, 'Bike ride'),
        (habit_2_id, current_user_id, CURRENT_DATE - 9, 1, 'Weight training'),
        (habit_2_id, current_user_id, CURRENT_DATE - 10, 1, 'Morning jog'),
        (habit_2_id, current_user_id, CURRENT_DATE - 12, 1, 'Gym workout'),
        (habit_2_id, current_user_id, CURRENT_DATE - 13, 1, 'Quick cardio session');
    
    -- Meditation logs (12 days)
    INSERT INTO habit_logs (habit_id, user_id, log_date, count, notes)
    VALUES 
        (habit_3_id, current_user_id, CURRENT_DATE, 1, '15 minutes before shift'),
        (habit_3_id, current_user_id, CURRENT_DATE - 1, 1, 'Evening meditation'),
        (habit_3_id, current_user_id, CURRENT_DATE - 2, 1, 'Morning practice'),
        (habit_3_id, current_user_id, CURRENT_DATE - 3, 1, 'Stress relief session'),
        (habit_3_id, current_user_id, CURRENT_DATE - 4, 1, 'Mindful breathing'),
        (habit_3_id, current_user_id, CURRENT_DATE - 5, 1, 'Guided meditation'),
        (habit_3_id, current_user_id, CURRENT_DATE - 7, 1, 'Quick 10-min session'),
        (habit_3_id, current_user_id, CURRENT_DATE - 8, 1, 'Deep relaxation'),
        (habit_3_id, current_user_id, CURRENT_DATE - 9, 1, 'Body scan meditation'),
        (habit_3_id, current_user_id, CURRENT_DATE - 11, 1, 'Mindfulness practice'),
        (habit_3_id, current_user_id, CURRENT_DATE - 12, 1, 'Evening wind-down'),
        (habit_3_id, current_user_id, CURRENT_DATE - 13, 1, 'Morning centering');

    RAISE NOTICE '✓ Created habit logs (2 weeks of tracking data)';

    -- ==================================================================
    -- STEP 9: Create circle announcements
    -- ==================================================================
    
    INSERT INTO circle_announcements (circle_id, author_id, title, content, priority)
    VALUES 
        (circle_1_id, current_user_id, 'Welcome to Emergency Department Team!',
         'Thanks for joining the team! Use this space to coordinate schedules, share updates, and support each other. Feel free to post shift swap requests or important announcements here.',
         'normal'),
        
        (circle_1_id, current_user_id, 'Schedule Changes Next Week',
         'Please note that we have adjusted the on-call rotation for next week due to the hospital conference. Check your updated shifts and let me know if there are any conflicts!',
         'high'),
        
        (circle_1_id, current_user_id, 'New COVID-19 Protocol Update',
         'Updated guidelines have been issued for handling COVID-19 cases in the ER. Please review the attached documentation in your email. Training session scheduled for Thursday at 2 PM.',
         'urgent'),
        
        (circle_2_id, current_user_id, 'ICU Night Shift Coordination',
         'Welcome to the ICU night shift team! Let''s work together to ensure smooth handoffs and excellent patient care. Post your availability and any concerns here.',
         'normal'),
        
        (circle_2_id, current_user_id, 'Equipment Maintenance This Weekend',
         'The ventilators in rooms 3 and 5 will undergo maintenance this weekend (Sat 9 AM - 5 PM). Patients will be temporarily relocated. Plan accordingly.',
         'high');

    RAISE NOTICE '✓ Created 5 circle announcements';

    -- ==================================================================
    -- SUCCESS! Show summary
    -- ==================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '✓✓✓ DUMMY DATA INSERTED SUCCESSFULLY! ✓✓✓';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary of what was created:';
    RAISE NOTICE '  • 1 user profile (yours) with avatar';
    RAISE NOTICE '  • 2 circles (Emergency Dept + ICU)';
    RAISE NOTICE '  • 10 shifts (5 work + 5 personal)';
    RAISE NOTICE '  • 10 personal tasks (8 pending + 2 completed)';
    RAISE NOTICE '  • 5 habits with tracking';
    RAISE NOTICE '  • 36 habit logs (2 weeks of data)';
    RAISE NOTICE '  • 5 circle announcements';
    RAISE NOTICE '';
    RAISE NOTICE 'Circle IDs:';
    RAISE NOTICE '  • Emergency Department Team: %', circle_1_id;
    RAISE NOTICE '  • ICU Night Shift: %', circle_2_id;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Go to your app and explore the data!';
    RAISE NOTICE '════════════════════════════════════════════════════════════';

END $$;

-- ==================================================================
-- VERIFICATION QUERIES
-- ==================================================================

-- Show your circles
SELECT 
    c.id,
    c.name,
    c.description,
    COUNT(cm.user_id) as member_count
FROM circles c
LEFT JOIN circle_members cm ON c.id = cm.circle_id
WHERE c.created_by = auth.uid()
GROUP BY c.id, c.name, c.description
ORDER BY c.created_at DESC;

-- Show your shifts
SELECT 
    s.id,
    s.title,
    s.start_time::date as date,
    s.category,
    c.name as circle_name
FROM shifts s
LEFT JOIN circles c ON s.circle_id = c.id
WHERE s.user_id = auth.uid()
ORDER BY s.start_time;

-- Show your tasks
SELECT 
    id,
    title,
    due_date,
    priority,
    category,
    completed
FROM personal_tasks
WHERE user_id = auth.uid()
ORDER BY completed, due_date;

-- Show your habits
SELECT 
    h.name as habit_name,
    h.frequency,
    h.target_count,
    COUNT(hl.id) as days_logged,
    ROUND(AVG(hl.count), 1) as avg_completion
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id
WHERE h.user_id = auth.uid()
GROUP BY h.id, h.name, h.frequency, h.target_count
ORDER BY h.name;

-- Summary statistics
SELECT 
    'Your Circles' as metric, 
    COUNT(*)::TEXT as count 
FROM circles WHERE created_by = auth.uid()
UNION ALL
SELECT 'Your Shifts', COUNT(*)::TEXT FROM shifts WHERE user_id = auth.uid()
UNION ALL
SELECT 'Your Tasks', COUNT(*)::TEXT FROM personal_tasks WHERE user_id = auth.uid()
UNION ALL
SELECT 'Your Habits', COUNT(*)::TEXT FROM habits WHERE user_id = auth.uid()
UNION ALL
SELECT 'Your Habit Logs', COUNT(*)::TEXT FROM habit_logs WHERE user_id = auth.uid()
UNION ALL
SELECT 'Your Announcements', COUNT(*)::TEXT FROM circle_announcements WHERE author_id = auth.uid();
