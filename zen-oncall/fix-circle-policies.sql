-- ============================================================================
-- FIX: Circle RLS policies causing infinite recursion
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop ALL existing policies for circle_members
DROP POLICY IF EXISTS "Users can view members in their circles" ON circle_members;
DROP POLICY IF EXISTS "Circle owners can manage members" ON circle_members;
DROP POLICY IF EXISTS "Users can view circle_members" ON circle_members;
DROP POLICY IF EXISTS "Users can insert themselves into circles" ON circle_members;
DROP POLICY IF EXISTS "Circle creators can add members" ON circle_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON circle_members;
DROP POLICY IF EXISTS "Users can delete their own membership" ON circle_members;

-- Drop ALL existing policies for circles
DROP POLICY IF EXISTS "Users can view circles they are in" ON circles;
DROP POLICY IF EXISTS "Users can view circles they are members of" ON circles;
DROP POLICY IF EXISTS "Users can view their circles" ON circles;
DROP POLICY IF EXISTS "Users can view circles" ON circles;
DROP POLICY IF EXISTS "Users can create circles" ON circles;
DROP POLICY IF EXISTS "Circle creators can update" ON circles;
DROP POLICY IF EXISTS "Circle creators can delete" ON circles;

-- ============================================================================
-- CIRCLES TABLE POLICIES (SIMPLIFIED - NO SUBQUERIES)
-- ============================================================================

-- Allow users to view ALL circles (simpler, no recursion risk)
CREATE POLICY "Users can view circles" ON circles
FOR SELECT
TO authenticated
USING (true);

-- Allow users to create circles
CREATE POLICY "Users can create circles" ON circles
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Allow circle creators to update their circles
CREATE POLICY "Circle creators can update" ON circles
FOR UPDATE
USING (auth.uid() = created_by);

-- Allow circle creators to delete their circles
CREATE POLICY "Circle creators can delete" ON circles
FOR DELETE
USING (auth.uid() = created_by);

-- ============================================================================
-- CIRCLE_MEMBERS TABLE POLICIES
-- ============================================================================

-- Create simpler, non-recursive policies for circle_members
CREATE POLICY "Users can view circle_members" ON circle_members
FOR SELECT
USING (true); -- Allow viewing all members (can be restricted later if needed)

CREATE POLICY "Users can insert themselves into circles" ON circle_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Circle creators can add members" ON circle_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM circles 
    WHERE circles.id = circle_members.circle_id 
    AND circles.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update their own membership" ON circle_members
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own membership" ON circle_members
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================

-- Check circles policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'circles'
ORDER BY policyname;

-- Check circle_members policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'circle_members'
ORDER BY policyname;
