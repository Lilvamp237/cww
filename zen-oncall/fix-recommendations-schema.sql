-- Fix recommendations table schema
-- Add missing columns that are required by the recommendation system

ALTER TABLE recommendations 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Update the table to use the new column names consistently
-- The code uses 'type' but table has 'recommendation_type'
UPDATE recommendations SET type = recommendation_type WHERE type IS NULL AND recommendation_type IS NOT NULL;

-- The code uses 'reason' but table has 'based_on'  
UPDATE recommendations SET reason = based_on WHERE reason IS NULL AND based_on IS NOT NULL;
