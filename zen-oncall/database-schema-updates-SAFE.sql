-- SAFE DATABASE SCHEMA UPDATES FOR ZEN-ONCALL
-- This version checks if things exist before creating them
-- Safe to run multiple times without errors

-- 1. Add category column to shifts table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shifts' AND column_name = 'category'
    ) THEN
        ALTER TABLE shifts ADD COLUMN category TEXT DEFAULT 'work';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shifts' AND column_name = 'color'
    ) THEN
        ALTER TABLE shifts ADD COLUMN color TEXT DEFAULT '#3b82f6';
    END IF;
END $$;

-- 2. Create personal_tasks table (if not exists)
CREATE TABLE IF NOT EXISTS personal_tasks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  due_time TEXT,
  priority TEXT DEFAULT 'medium', -- low, medium, high
  category TEXT DEFAULT 'personal', -- personal, meal, hydration, rest, errand
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create habits table (if not exists)
CREATE TABLE IF NOT EXISTS habits (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily', -- daily, weekly, custom
  target_count INTEGER DEFAULT 1,
  icon TEXT,
  color TEXT DEFAULT '#10b981',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create habit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS habit_logs (
  id BIGSERIAL PRIMARY KEY,
  habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- 5. Create circle_announcements table (if not exists)
CREATE TABLE IF NOT EXISTS circle_announcements (
  id BIGSERIAL PRIMARY KEY,
  circle_id BIGINT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create shift_swaps table (if not exists)
CREATE TABLE IF NOT EXISTS shift_swaps (
  id BIGSERIAL PRIMARY KEY,
  circle_id BIGINT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_shift_id BIGINT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_shift_id BIGINT REFERENCES shifts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, cancelled
  message TEXT,
  response_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add privacy settings to circle_members table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'circle_members' AND column_name = 'share_shifts'
    ) THEN
        ALTER TABLE circle_members ADD COLUMN share_shifts BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'circle_members' AND column_name = 'share_status'
    ) THEN
        ALTER TABLE circle_members ADD COLUMN share_status BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 8. Create indexes for better performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_personal_tasks_user_date ON personal_tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_personal_tasks_completed ON personal_tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_habits_user_active ON habits(user_id, active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, log_date);
CREATE INDEX IF NOT EXISTS idx_announcements_circle ON circle_announcements(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_circle ON shift_swaps(circle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_requester ON shift_swaps(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_shift_swaps_target ON shift_swaps(target_user_id, status);

-- 9. Enable Row Level Security (safe to run multiple times)
ALTER TABLE personal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swaps ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies for personal_tasks (with DROP IF EXISTS)
DROP POLICY IF EXISTS "Users can view their own tasks" ON personal_tasks;
CREATE POLICY "Users can view their own tasks" ON personal_tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON personal_tasks;
CREATE POLICY "Users can insert their own tasks" ON personal_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON personal_tasks;
CREATE POLICY "Users can update their own tasks" ON personal_tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON personal_tasks;
CREATE POLICY "Users can delete their own tasks" ON personal_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Create RLS Policies for habits (with DROP IF EXISTS)
DROP POLICY IF EXISTS "Users can view their own habits" ON habits;
CREATE POLICY "Users can view their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own habits" ON habits;
CREATE POLICY "Users can insert their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habits" ON habits;
CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habits" ON habits;
CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Create RLS Policies for habit_logs (with DROP IF EXISTS)
DROP POLICY IF EXISTS "Users can view their own habit logs" ON habit_logs;
CREATE POLICY "Users can view their own habit logs" ON habit_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own habit logs" ON habit_logs;
CREATE POLICY "Users can insert their own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habit logs" ON habit_logs;
CREATE POLICY "Users can update their own habit logs" ON habit_logs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habit logs" ON habit_logs;
CREATE POLICY "Users can delete their own habit logs" ON habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 13. Create RLS Policies for circle_announcements (with DROP IF EXISTS)
DROP POLICY IF EXISTS "Circle members can view announcements" ON circle_announcements;
CREATE POLICY "Circle members can view announcements" ON circle_announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_members.circle_id = circle_announcements.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Circle members can create announcements" ON circle_announcements;
CREATE POLICY "Circle members can create announcements" ON circle_announcements
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_members.circle_id = circle_announcements.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authors can update their own announcements" ON circle_announcements;
CREATE POLICY "Authors can update their own announcements" ON circle_announcements
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own announcements" ON circle_announcements;
CREATE POLICY "Authors can delete their own announcements" ON circle_announcements
  FOR DELETE USING (auth.uid() = author_id);

-- 14. Create RLS Policies for shift_swaps (with DROP IF EXISTS)
DROP POLICY IF EXISTS "Circle members can view shift swaps" ON shift_swaps;
CREATE POLICY "Circle members can view shift swaps" ON shift_swaps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_members.circle_id = shift_swaps.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Circle members can create shift swaps" ON shift_swaps;
CREATE POLICY "Circle members can create shift swaps" ON shift_swaps
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id AND
    EXISTS (
      SELECT 1 FROM circle_members
      WHERE circle_members.circle_id = shift_swaps.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Requester or target can update shift swaps" ON shift_swaps;
CREATE POLICY "Requester or target can update shift swaps" ON shift_swaps
  FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = target_user_id
  );

DROP POLICY IF EXISTS "Requester can delete their shift swaps" ON shift_swaps;
CREATE POLICY "Requester can delete their shift swaps" ON shift_swaps
  FOR DELETE USING (auth.uid() = requester_id);

-- 15. Create function to update updated_at timestamp (with OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers for updated_at columns (drop and recreate)
DROP TRIGGER IF EXISTS update_personal_tasks_updated_at ON personal_tasks;
CREATE TRIGGER update_personal_tasks_updated_at BEFORE UPDATE ON personal_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON circle_announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON circle_announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shift_swaps_updated_at ON shift_swaps;
CREATE TRIGGER update_shift_swaps_updated_at BEFORE UPDATE ON shift_swaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✓ Schema updates completed successfully!';
  RAISE NOTICE '✓ All tables, indexes, and policies are up to date.';
  RAISE NOTICE '✓ Safe to run multiple times - no errors!';
END $$;
