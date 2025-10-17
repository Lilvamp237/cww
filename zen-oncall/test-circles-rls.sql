-- ============================================================================
-- TEST: Check if circles can be queried with RLS
-- Run this in Supabase SQL Editor while logged in
-- ============================================================================

-- Test 1: Can you see circles at all?
SELECT 
    'TEST 1: All circles' as test,
    id,
    name,
    created_by
FROM circles
ORDER BY id DESC;

-- Test 2: Check RLS policies
SELECT 
    'TEST 2: RLS Policies on circles' as test,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'circles';

-- Test 3: Is RLS even enabled?
SELECT 
    'TEST 3: RLS Status' as test,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('circles', 'circle_members');

-- Test 4: Test the specific query that's failing
-- Replace YOUR_USER_ID with your actual UUID
SELECT 
    'TEST 4: Your circles via membership' as test,
    c.*
FROM circles c
WHERE c.id IN (
    SELECT circle_id 
    FROM circle_members 
    WHERE user_id = '5614df0a-5d61-4a3b-b68f-85ad5d75c08f'
);
