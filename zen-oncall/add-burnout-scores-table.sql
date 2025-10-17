-- Add burnout_scores table for tracking burnout analysis over time

CREATE TABLE IF NOT EXISTS public.burnout_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('Low', 'Moderate', 'High', 'Critical')),
    factors JSONB,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_burnout_scores_user_id ON public.burnout_scores(user_id);
CREATE INDEX idx_burnout_scores_created_at ON public.burnout_scores(created_at DESC);

-- Enable RLS
ALTER TABLE public.burnout_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own burnout scores"
    ON public.burnout_scores
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own burnout scores"
    ON public.burnout_scores
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.burnout_scores TO authenticated;

COMMENT ON TABLE public.burnout_scores IS 'Tracks burnout risk analysis scores over time';
