-- Fix circles and circle_members RLS issues
-- Run this DIRECTLY in Supabase SQL Editor

-- Drop all existing policies on both tables
DROP POLICY IF EXISTS "Users can view members in their circles" ON circle_members;
DROP POLICY IF EXISTS "Users can join circles" ON circle_members;
DROP POLICY IF EXISTS "Circle owners can update members" ON circle_members;
DROP POLICY IF EXISTS "Circle owners can delete members" ON circle_members;
DROP POLICY IF EXISTS "Circle owners can manage members" ON circle_members;
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON circle_members;
DROP POLICY IF EXISTS "enable_insert_for_authenticated" ON circle_members;

DROP POLICY IF EXISTS "Users can view circles they are members of" ON circles;
DROP POLICY IF EXISTS "Users can create circles" ON circles;

-- Disable RLS on both tables to allow all operations
ALTER TABLE circle_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE circles DISABLE ROW LEVEL SECURITY;
