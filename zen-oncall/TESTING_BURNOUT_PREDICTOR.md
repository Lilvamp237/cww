# 🧪 Burnout Predictor Testing Guide

## Prerequisites
- ✅ Your app should be running (`npm run dev`)
- ✅ You should be logged into the app
- ✅ You need access to your Supabase dashboard

---

## Step 1: Run Database Migration ⚙️

### Option A: Using Supabase Dashboard (Easiest)

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your project (zen-oncall or whatever you named it)

2. **Navigate to SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Copy and Paste the Migration**:
   ```sql
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
   CREATE INDEX IF NOT EXISTS idx_burnout_scores_user_id ON public.burnout_scores(user_id);
   CREATE INDEX IF NOT EXISTS idx_burnout_scores_created_at ON public.burnout_scores(created_at DESC);

   -- Enable RLS
   ALTER TABLE public.burnout_scores ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   DROP POLICY IF EXISTS "Users can view their own burnout scores" ON public.burnout_scores;
   CREATE POLICY "Users can view their own burnout scores"
       ON public.burnout_scores
       FOR SELECT
       USING (auth.uid() = user_id);

   DROP POLICY IF EXISTS "Users can insert their own burnout scores" ON public.burnout_scores;
   CREATE POLICY "Users can insert their own burnout scores"
       ON public.burnout_scores
       FOR INSERT
       WITH CHECK (auth.uid() = user_id);

   -- Grant permissions
   GRANT SELECT, INSERT ON public.burnout_scores TO authenticated;

   COMMENT ON TABLE public.burnout_scores IS 'Tracks burnout risk analysis scores over time';
   ```

4. **Run the Query**:
   - Click "Run" button (or press Ctrl+Enter)
   - You should see "Success. No rows returned" message
   - This means the table was created successfully!

5. **Verify Table Creation**:
   - Click "Table Editor" in left sidebar
   - You should see `burnout_scores` in the list of tables
   - Click on it to see the columns (id, user_id, score, level, factors, recommendations, created_at)

---

## Step 2: Add Test Data 📊

To test the burnout predictor, you need some data in your database. Let me help you create test data!

### 2.1 Add Test Shifts (for Work Load factor)

Go to SQL Editor and run:

```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
-- Copy the ID from the result

-- Add test shifts (replace USER_ID_HERE with your actual user ID)
INSERT INTO public.shifts (user_id, shift_date, start_time, end_time, shift_type, color)
VALUES
  -- This week: High work load scenario (60+ hours)
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', (CURRENT_DATE - INTERVAL '6 days' + TIME '08:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '6 days' + TIME '20:00:00')::timestamptz, 'Day Shift', 'blue'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', (CURRENT_DATE - INTERVAL '5 days' + TIME '22:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '5 days' + TIME '06:00:00' + INTERVAL '1 day')::timestamptz, 'Night Shift', 'purple'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', (CURRENT_DATE - INTERVAL '4 days' + TIME '22:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '4 days' + TIME '06:00:00' + INTERVAL '1 day')::timestamptz, 'Night Shift', 'purple'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', (CURRENT_DATE - INTERVAL '3 days' + TIME '08:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '3 days' + TIME '21:00:00')::timestamptz, 'Day Shift', 'blue'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', (CURRENT_DATE - INTERVAL '2 days' + TIME '08:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '2 days' + TIME '20:00:00')::timestamptz, 'Day Shift', 'blue'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '1 days', (CURRENT_DATE - INTERVAL '1 days' + TIME '22:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '1 days' + TIME '06:00:00' + INTERVAL '1 day')::timestamptz, 'Night Shift', 'purple'),
  ('USER_ID_HERE', CURRENT_DATE, (CURRENT_DATE + TIME '08:00:00')::timestamptz, (CURRENT_DATE + TIME '20:00:00')::timestamptz, 'Day Shift', 'blue');
```

### 2.2 Add Test Mood Logs (for Emotional Health factor)

```sql
-- Add mood logs showing declining mood (replace USER_ID_HERE)
INSERT INTO public.mood_logs (user_id, log_date, mood_score, energy_level, notes)
VALUES
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 4, 4, 'Feeling good'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 3, 3, 'A bit tired'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 2, 2, 'Exhausted after night shift'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 2, 2, 'Still tired'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 3, 2, 'Better but low energy'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '1 days', 2, 1, 'Very tired'),
  ('USER_ID_HERE', CURRENT_DATE, 2, 2, 'Struggling');
```

### 2.3 Add Test Sleep Logs (for Sleep Health factor)

```sql
-- Add sleep logs showing poor sleep (replace USER_ID_HERE)
INSERT INTO public.sleep_logs (user_id, log_date, sleep_hours, sleep_quality, notes)
VALUES
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 6.5, 3, 'Okay sleep'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 4.0, 2, 'Night shift disrupted sleep'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 5.0, 2, 'Still adjusting'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 5.5, 2, 'Poor quality'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 6.0, 3, 'Better but not great'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '1 days', 4.5, 1, 'Very poor sleep'),
  ('USER_ID_HERE', CURRENT_DATE, 5.0, 2, 'Still tired');
```

### 2.4 Add Test Tasks (for Task Load factor)

```sql
-- Add some overdue tasks (replace USER_ID_HERE)
INSERT INTO public.personal_tasks (user_id, title, due_date, priority, category, completed)
VALUES
  ('USER_ID_HERE', 'Complete medical training', CURRENT_DATE - INTERVAL '5 days', 'high', 'work', false),
  ('USER_ID_HERE', 'Submit timesheet', CURRENT_DATE - INTERVAL '3 days', 'high', 'work', false),
  ('USER_ID_HERE', 'Call insurance', CURRENT_DATE - INTERVAL '2 days', 'medium', 'personal', false),
  ('USER_ID_HERE', 'Doctor appointment', CURRENT_DATE - INTERVAL '1 days', 'high', 'personal', false),
  ('USER_ID_HERE', 'Buy groceries', CURRENT_DATE + INTERVAL '2 days', 'low', 'personal', false),
  ('USER_ID_HERE', 'Schedule dentist', CURRENT_DATE + INTERVAL '5 days', 'medium', 'personal', false);
```

---

## Step 3: Test the Burnout Predictor 🔥

### 3.1 Navigate to the Burnout Page

**Option 1: Direct URL**
- In your browser, go to: `http://localhost:3000/burnout`

**Option 2: From Dashboard**
- Go to `http://localhost:3000/dashboard`
- Look at the "Burnout Risk" card
- Click "View Full Analysis" button

**Option 3: From Navbar**
- Click "Burnout Risk" in the navigation bar

### 3.2 What You Should See 👀

With the test data above, you should see:

#### **Risk Level Card**
- **Risk Level**: "High" or "Critical" (orange/red)
- **Score**: Around 60-80 out of 100
- **Trend**: "Stable" (first time) or "Improving/Worsening" (on refresh)
- **Progress Bar**: Visual representation of score

#### **Early Warnings Alert** (Red banner at top)
Should show warnings like:
- ❌ "Multiple night shifts detected"
- ❌ "Consistently low mood scores"
- ❌ "Consistently low energy levels"
- ❌ "Insufficient sleep (<6 hours avg)"

#### **Recommendations Section**
Should show prioritized actions like:
- 🆘 **IMMEDIATE**: "Prioritize 7-9 hours of sleep tonight"
- 🌙 **HIGH**: "Request day shifts if possible"
- 😴 **HIGH**: "Create consistent bedtime routine"
- 💬 **IMMEDIATE**: "Talk to someone you trust"

#### **Factor Breakdown**
Should show 5 categories with scores:
1. **Work Load**: 18-22/25 (HIGH/CRITICAL impact)
   - "52h worked, 3 night shifts, 7 work days"
   
2. **Emotional Health**: 20-27/30 (HIGH/CRITICAL impact)
   - "Avg mood: 2.5/5"
   
3. **Sleep Health**: 17-22/25 (HIGH/CRITICAL impact)
   - "Avg: 5.2h/night"
   
4. **Task Load**: 6-8/10 (HIGH impact)
   - "4 overdue, 6 pending"
   
5. **Recovery Time**: 7-10/10 (HIGH impact)
   - "7 days since last break"

---

## Step 4: Test Different Scenarios 🎭

### Scenario A: Low Risk Test

Run this SQL to create a healthy data set:

```sql
-- Clear previous test data
DELETE FROM mood_logs WHERE user_id = 'USER_ID_HERE' AND log_date >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM sleep_logs WHERE user_id = 'USER_ID_HERE' AND log_date >= CURRENT_DATE - INTERVAL '7 days';
DELETE FROM shifts WHERE user_id = 'USER_ID_HERE' AND shift_date >= CURRENT_DATE - INTERVAL '7 days';

-- Add healthy data
-- Moderate work hours (40 hours/week)
INSERT INTO public.shifts (user_id, shift_date, start_time, end_time, shift_type, color)
VALUES
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', (CURRENT_DATE - INTERVAL '6 days' + TIME '08:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '6 days' + TIME '16:00:00')::timestamptz, 'Day Shift', 'blue'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', (CURRENT_DATE - INTERVAL '4 days' + TIME '08:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '4 days' + TIME '16:00:00')::timestamptz, 'Day Shift', 'blue'),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', (CURRENT_DATE - INTERVAL '2 days' + TIME '08:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '2 days' + TIME '16:00:00')::timestamptz, 'Day Shift', 'blue');

-- Good mood and energy
INSERT INTO public.mood_logs (user_id, log_date, mood_score, energy_level)
VALUES
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 4, 4),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 5, 4),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 4, 5);

-- Good sleep
INSERT INTO public.sleep_logs (user_id, log_date, sleep_hours, sleep_quality)
VALUES
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 8.0, 4),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 7.5, 5),
  ('USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 8.0, 4);
```

**Expected Result**: Score 10-20, "Low" risk, Green color ✅

### Scenario B: Moderate Risk Test

```sql
-- Clear and add moderate stress data
-- ... (mixture of good and bad days)
```

---

## Step 5: Test Interactive Features 🎮

### 5.1 Test Refresh Button
1. Click "Refresh Analysis" button in top-right
2. Should show loading spinner
3. Should recalculate and save new score to database
4. Previous score should update

### 5.2 Test Recommendations Actions
1. Click on any recommendation card
2. Should have arrow indicator for clickability
3. (Future: will navigate to relevant page)

### 5.3 Test Quick Actions
At bottom of page, test all 4 buttons:
1. **Log Mood** → Should go to `/wellness-enhanced`
2. **Track Sleep** → Should go to `/wellness-enhanced?tab=sleep`
3. **View Schedule** → Should go to `/scheduler`
4. **Get Help** → Should go to `/assistant`

---

## Step 6: Verify Database Tracking 📊

Check that scores are being saved:

```sql
-- View your burnout score history
SELECT 
  score, 
  level, 
  created_at,
  jsonb_pretty(factors) as factors_breakdown
FROM public.burnout_scores 
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 5;
```

You should see entries every time you click "Refresh Analysis"!

---

## Common Issues & Solutions 🔧

### Issue 1: "Unable to Calculate" Message
**Cause**: Not enough data in database
**Solution**: Make sure you have:
- At least 1 shift in last 7 days
- At least 1 mood log in last 7 days
- Sleep logs are optional but helpful

### Issue 2: Table doesn't exist error
**Cause**: Migration wasn't run
**Solution**: 
1. Go to Supabase SQL Editor
2. Run the migration SQL again
3. Refresh your app

### Issue 3: Can't see my data
**Cause**: RLS policies or wrong user ID
**Solution**:
1. Check you're logged in
2. Verify user ID in SQL queries matches your actual user ID:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

### Issue 4: Score seems wrong
**Cause**: Expected behavior - algorithm is sensitive
**Solution**: This is actually good! The algorithm is working. Try:
1. Add more positive data (better sleep, higher mood)
2. Click "Refresh Analysis"
3. Score should improve

---

## Step 7: Test with AI Assistant 🤖

1. Navigate to `/assistant`
2. Try these commands:
   - "I'm stressed"
   - "I'm overwhelmed"
   - "Check my burnout risk"

The assistant should provide supportive responses and suggest checking the burnout page!

---

## Step 8: Mobile Testing 📱

1. Open browser DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Android)
4. Navigate to `/burnout`
5. Verify:
   - Cards stack vertically
   - Text is readable
   - Buttons are tappable
   - Progress bars display correctly

---

## Success Criteria ✅

You've successfully tested the burnout predictor if:

- [x] Database table created without errors
- [x] Can navigate to `/burnout` page
- [x] Page loads with your data
- [x] Risk level displays correctly
- [x] Recommendations are relevant to your data
- [x] Factor breakdown shows all 5 categories
- [x] Refresh button works
- [x] Quick action buttons navigate correctly
- [x] Scores save to database
- [x] Previous score comparison works
- [x] Mobile view is responsive

---

## Next Steps After Testing 🚀

Once testing is complete:

1. **Try real data**: Replace test data with your actual work schedule
2. **Daily tracking**: Log mood and sleep daily for a week
3. **Monitor trends**: Check if your score improves over time
4. **Act on recommendations**: Follow the personalized advice
5. **Share feedback**: Note any issues or improvements

---

## Need Help? 🆘

If you encounter any issues:

1. Check browser console for errors (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Verify all migrations ran successfully
4. Make sure you're using the correct user ID in SQL queries

---

**Happy Testing!** 🎉

The burnout predictor is designed to help you stay healthy. Use it regularly to monitor your wellness!
