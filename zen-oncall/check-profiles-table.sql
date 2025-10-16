-- CHECK PROFILES TABLE STRUCTURE
-- Run this first to see what columns exist in your profiles table

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
