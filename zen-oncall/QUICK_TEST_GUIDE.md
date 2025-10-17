# 🚀 Quick Start: Testing Burnout Predictor in 5 Minutes

## Step 1: Database Migration (2 minutes)

### What to do:
1. Open https://supabase.com/dashboard
2. Select your zen-oncall project
3. Click "**SQL Editor**" (left sidebar)
4. Click "**New query**" button
5. Copy this entire code block:

```sql
CREATE TABLE IF NOT EXISTS public.burnout_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('Low', 'Moderate', 'High', 'Critical')),
    factors JSONB,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_burnout_scores_user_id ON public.burnout_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_burnout_scores_created_at ON public.burnout_scores(created_at DESC);

ALTER TABLE public.burnout_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own burnout scores" ON public.burnout_scores;
CREATE POLICY "Users can view their own burnout scores"
    ON public.burnout_scores FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own burnout scores" ON public.burnout_scores;
CREATE POLICY "Users can insert their own burnout scores"
    ON public.burnout_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.burnout_scores TO authenticated;
```

6. Click "**Run**" (or press Ctrl+Enter)
7. ✅ Should see "Success. No rows returned"

---

## Step 2: Add Test Data (2 minutes)

### First, get your User ID:

In Supabase SQL Editor, run:
```sql
SELECT id, email FROM auth.users;
```

**Copy the ID** from the result (looks like: `123e4567-e89b-12d3-a456-426614174000`)

### Then, add test data:

**Replace `YOUR_USER_ID_HERE` with your actual ID** in the code below, then run it:

```sql
-- IMPORTANT: Replace YOUR_USER_ID_HERE with your actual user ID from above!

-- Add shifts (creates high work load)
INSERT INTO public.shifts (user_id, shift_date, start_time, end_time, shift_type, color)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 6, (CURRENT_DATE - 6 + TIME '08:00:00')::timestamptz, (CURRENT_DATE - 6 + TIME '20:00:00')::timestamptz, 'Day', 'blue'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 5, (CURRENT_DATE - 5 + TIME '22:00:00')::timestamptz, (CURRENT_DATE - 4 + TIME '06:00:00')::timestamptz, 'Night', 'purple'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 4, (CURRENT_DATE - 4 + TIME '22:00:00')::timestamptz, (CURRENT_DATE - 3 + TIME '06:00:00')::timestamptz, 'Night', 'purple'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 3, (CURRENT_DATE - 3 + TIME '08:00:00')::timestamptz, (CURRENT_DATE - 3 + TIME '20:00:00')::timestamptz, 'Day', 'blue'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 2, (CURRENT_DATE - 2 + TIME '08:00:00')::timestamptz, (CURRENT_DATE - 2 + TIME '20:00:00')::timestamptz, 'Day', 'blue'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 1, (CURRENT_DATE - 1 + TIME '22:00:00')::timestamptz, (CURRENT_DATE + TIME '06:00:00')::timestamptz, 'Night', 'purple'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE, (CURRENT_DATE + TIME '08:00:00')::timestamptz, (CURRENT_DATE + TIME '20:00:00')::timestamptz, 'Day', 'blue');

-- Add mood logs (creates emotional stress)
INSERT INTO public.mood_logs (user_id, log_date, mood_score, energy_level, notes)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 6, 4, 4, 'Okay'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 5, 3, 3, 'Tired'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 4, 2, 2, 'Exhausted'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 3, 2, 2, 'Still tired'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 2, 3, 2, 'Better'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 1, 2, 1, 'Very tired'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE, 2, 2, 'Struggling');

-- Add sleep logs (creates sleep deprivation)
INSERT INTO public.sleep_logs (user_id, log_date, sleep_hours, sleep_quality)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 6, 6.5, 3),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 5, 4.0, 2),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 4, 5.0, 2),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 3, 5.5, 2),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 2, 6.0, 3),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 1, 4.5, 1),
  ('YOUR_USER_ID_HERE', CURRENT_DATE, 5.0, 2);

-- Add overdue tasks (creates task stress)
INSERT INTO public.personal_tasks (user_id, title, due_date, priority, category, completed)
VALUES
  ('YOUR_USER_ID_HERE', 'Complete training', CURRENT_DATE - 5, 'high', 'work', false),
  ('YOUR_USER_ID_HERE', 'Submit timesheet', CURRENT_DATE - 3, 'high', 'work', false),
  ('YOUR_USER_ID_HERE', 'Call insurance', CURRENT_DATE - 2, 'medium', 'personal', false),
  ('YOUR_USER_ID_HERE', 'Doctor appointment', CURRENT_DATE - 1, 'high', 'personal', false);
```

✅ Should see "Success. 18 rows returned" (or similar)

---

## Step 3: View the Burnout Predictor (1 minute)

### Option 1: Direct URL
- Open your browser
- Go to: **`http://localhost:3000/burnout`**

### Option 2: From Dashboard
- Go to: **`http://localhost:3000/dashboard`**
- Find the **"Burnout Risk"** card (orange/red)
- Click **"View Full Analysis"** button

### Option 3: From Navbar
- Look at the top navigation bar
- Click **"Burnout Risk"** (should have a warning triangle icon ⚠️)

---

## Step 4: What You Should See 👀

With the test data, you should see:

### 🔴 **Overall Risk Card** (at the top)
- **Risk Level**: "High" or "Critical" (orange/red color)
- **Score**: Around 65-80 out of 100
- **Big progress bar** showing the percentage
- **Message**: Something like "High burnout risk! Take immediate action..."

### ⚠️ **Early Warnings** (red alert banner)
Should list warnings like:
- "Multiple night shifts detected"
- "Consistently low mood scores"
- "Insufficient sleep (<6 hours avg)"

### 💡 **Recommendations** (big cards with emojis)
Should show actions like:
- 🆘 **IMMEDIATE**: "Prioritize 7-9 hours of sleep tonight"
- 🌙 **HIGH**: "Request day shifts if possible"
- 💬 **IMMEDIATE**: "Talk to someone you trust"

### 📊 **Factor Breakdown** (5 progress bars)
1. **Work Load**: ~18/25 (HIGH impact) - "52h worked, 3 night shifts..."
2. **Emotional Health**: ~22/30 (HIGH impact) - "Avg mood: 2.3/5"
3. **Sleep Health**: ~19/25 (CRITICAL impact) - "Avg: 5.2h/night"
4. **Task Load**: ~6/10 (HIGH impact) - "4 overdue, 4 pending"
5. **Recovery Time**: ~10/10 (HIGH impact) - "7 days since last break"

### ⚡ **Quick Actions** (4 buttons at bottom)
- Log Mood
- Track Sleep
- View Schedule
- Get Help

---

## Step 5: Test It! (30 seconds)

1. **Click "Refresh Analysis"** (top right)
   - Should show spinner
   - Should recalculate score
   - Should update the page

2. **Click any Quick Action button**
   - Should navigate to that page
   - Try "Log Mood" → should go to wellness page

3. **Check if it saved**
   - Go back to Supabase SQL Editor
   - Run: `SELECT * FROM burnout_scores ORDER BY created_at DESC LIMIT 1;`
   - Should see your score saved! ✅

---

## ✅ Success!

If you see all of the above, **the burnout predictor is working perfectly!** 🎉

---

## 🎯 What This Data Means

The test data simulates a **healthcare worker under high stress**:
- Working 60+ hours/week (excessive)
- 3 night shifts in 7 days (circadian disruption)
- 7 consecutive work days (no recovery)
- Low mood (avg 2.5/5) and energy (avg 2.3/5)
- Poor sleep (avg 5.2 hours vs recommended 7-9)
- 4 overdue tasks (task overload)

**Result**: High/Critical burnout risk with urgent recommendations

---

## 🧪 Try Good Data Next!

Want to see the difference? Clear the test data and add healthy data:

```sql
-- Clear test data
DELETE FROM mood_logs WHERE user_id = 'YOUR_USER_ID_HERE' AND log_date >= CURRENT_DATE - 7;
DELETE FROM sleep_logs WHERE user_id = 'YOUR_USER_ID_HERE' AND log_date >= CURRENT_DATE - 7;
DELETE FROM shifts WHERE user_id = 'YOUR_USER_ID_HERE' AND shift_date >= CURRENT_DATE - 7;
DELETE FROM personal_tasks WHERE user_id = 'YOUR_USER_ID_HERE';

-- Add healthy data (40h/week, good sleep, happy mood)
-- Shifts: 3 days, 8 hours each
INSERT INTO shifts (user_id, shift_date, start_time, end_time, shift_type, color)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 6, (CURRENT_DATE - 6 + TIME '08:00')::timestamptz, (CURRENT_DATE - 6 + TIME '16:00')::timestamptz, 'Day', 'blue'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 4, (CURRENT_DATE - 4 + TIME '08:00')::timestamptz, (CURRENT_DATE - 4 + TIME '16:00')::timestamptz, 'Day', 'blue'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 2, (CURRENT_DATE - 2 + TIME '08:00')::timestamptz, (CURRENT_DATE - 2 + TIME '16:00')::timestamptz, 'Day', 'blue');

-- Good mood
INSERT INTO mood_logs (user_id, log_date, mood_score, energy_level) VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 6, 4, 4),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 4, 5, 4),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 2, 4, 5);

-- Good sleep
INSERT INTO sleep_logs (user_id, log_date, sleep_hours, sleep_quality) VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 6, 8.0, 4),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 4, 7.5, 5),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - 2, 8.0, 4);
```

Now refresh the burnout page → Should show **"Low" risk in green!** ✅

---

## 📝 Summary

1. ✅ Run database migration in Supabase
2. ✅ Get your user ID
3. ✅ Insert test data (replace YOUR_USER_ID_HERE)
4. ✅ Navigate to `/burnout`
5. ✅ See high risk with recommendations
6. ✅ Click "Refresh Analysis" to test
7. ✅ Try healthy data to see low risk

**Total time**: ~5 minutes ⏱️

---

**Need detailed help?** See `TESTING_BURNOUT_PREDICTOR.md` for comprehensive guide!
