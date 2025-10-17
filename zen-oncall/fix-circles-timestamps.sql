-- ============================================================================
-- FIX: Add missing timestamp columns to circles table
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Add created_at and updated_at if they don't exist
ALTER TABLE circles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE circles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing circles to have created_at
UPDATE circles SET created_at = NOW() WHERE created_at IS NULL;

-- Verify
SELECT 
    id,
    name,
    invite_code,
    created_by,
    created_at,
    updated_at
FROM circles
ORDER BY id DESC;
