    -- ============================================================================
    -- FIX: Add missing invite_code column to circles table
    -- Run this in Supabase SQL Editor
    -- ============================================================================

    -- Add invite_code column if it doesn't exist
    ALTER TABLE circles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

    -- Add missing columns to circle_members if they don't exist
    ALTER TABLE circle_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
    ALTER TABLE circle_members ADD COLUMN IF NOT EXISTS share_shifts BOOLEAN DEFAULT TRUE;
    ALTER TABLE circle_members ADD COLUMN IF NOT EXISTS share_status BOOLEAN DEFAULT TRUE;

    -- Generate invite codes for existing circles that don't have one
    UPDATE circles 
    SET invite_code = substring(md5(random()::text || clock_timestamp()::text) from 1 for 8)
    WHERE invite_code IS NULL;

    -- Verify the changes
    SELECT 
        'circles table' as table_name,
        id, 
        name, 
        invite_code,
        created_by
    FROM circles
    ORDER BY id;

    SELECT 
        'circle_members table' as table_name,
        id,
        circle_id,
        user_id,
        role,
        share_shifts,
        share_status
    FROM circle_members
    ORDER BY id;
