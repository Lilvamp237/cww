-- ============================================================================
-- DEBUG: Check circles and memberships (SIMPLIFIED)
-- Run this in Supabase SQL Editor to see what's in the database
-- ============================================================================

-- Show all circles (without created_at since it doesn't exist)
SELECT 
    'CIRCLES TABLE' as info,
    id,
    name,
    invite_code,
    created_by
FROM circles
ORDER BY id DESC;

-- Show all circle members
SELECT 
    'CIRCLE_MEMBERS TABLE' as info,
    id,
    circle_id,
    user_id,
    role,
    share_shifts,
    share_status
FROM circle_members
ORDER BY id DESC;

-- Check if the creator is in circle_members (THIS IS THE KEY!)
SELECT 
    'CREATOR MEMBERSHIP CHECK' as info,
    c.id as circle_id,
    c.name as circle_name,
    c.created_by as creator_id,
    cm.user_id as member_user_id,
    CASE 
        WHEN cm.user_id IS NULL THEN '❌ CREATOR NOT ADDED AS MEMBER - THIS IS THE BUG!'
        ELSE '✅ Creator is a member'
    END as status
FROM circles c
LEFT JOIN circle_members cm ON c.id = cm.circle_id AND c.created_by = cm.user_id
ORDER BY c.id DESC;
