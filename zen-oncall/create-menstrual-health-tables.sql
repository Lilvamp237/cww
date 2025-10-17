-- Create menstrual health tracking tables
-- Run this in your Supabase SQL Editor

-- Table for tracking menstrual cycles
CREATE TABLE IF NOT EXISTS menstrual_cycles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_start_date DATE NOT NULL,
  cycle_length INTEGER DEFAULT 28,
  period_length INTEGER DEFAULT 5,
  predicted_next_period DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cycle_start_date)
);

-- Table for daily menstrual logs
CREATE TABLE IF NOT EXISTS menstrual_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  cycle_day INTEGER NOT NULL,
  flow_level TEXT CHECK (flow_level IN ('Light', 'Medium', 'Heavy', 'Spotting', 'None')),
  symptoms TEXT[] DEFAULT '{}',
  mood TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_user_id ON menstrual_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_cycles_start_date ON menstrual_cycles(cycle_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_menstrual_logs_user_id ON menstrual_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_menstrual_logs_date ON menstrual_logs(log_date DESC);

-- Enable Row Level Security
ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menstrual_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menstrual_cycles
CREATE POLICY "Users can view their own cycles"
  ON menstrual_cycles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycles"
  ON menstrual_cycles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycles"
  ON menstrual_cycles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycles"
  ON menstrual_cycles
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for menstrual_logs
CREATE POLICY "Users can view their own logs"
  ON menstrual_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON menstrual_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON menstrual_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON menstrual_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update predicted_next_period
CREATE OR REPLACE FUNCTION update_predicted_next_period()
RETURNS TRIGGER AS $$
BEGIN
  NEW.predicted_next_period := NEW.cycle_start_date + (NEW.cycle_length || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update predicted_next_period on insert/update
CREATE TRIGGER trigger_update_predicted_next_period
  BEFORE INSERT OR UPDATE ON menstrual_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_predicted_next_period();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_menstrual_cycles_updated_at
  BEFORE UPDATE ON menstrual_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_menstrual_logs_updated_at
  BEFORE UPDATE ON menstrual_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON menstrual_cycles TO authenticated;
GRANT ALL ON menstrual_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
