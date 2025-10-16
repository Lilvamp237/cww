# 🚀 UPDATED: Correct Order to Run SQL Scripts

Follow these steps **IN THIS EXACT ORDER** to avoid errors:

## ✅ Step-by-Step Instructions

### 1️⃣ Run Schema Updates (Creates Tables)
**File:** `database-schema-updates.sql`

This creates all the necessary tables:
- `personal_tasks`
- `habits`
- `habit_logs`
- `circle_announcements`
- `shift_swaps`
- And adds columns to existing tables

**Status:** ✅ Run this first

---

### 2️⃣ Run Quick Fix (RLS Policies & Profiles)
**File:** `quick-fix.sql`

This ensures:
- Profiles table exists
- RLS policies are set up
- Privacy columns added
- Triggers are created

**Status:** ✅ Run this second

---

### 3️⃣ OPTIONAL: Fix Profiles Table (If needed)
**File:** `fix-profiles-table.sql`

⚠️ **Only run this if you get an error about `avatar_url` column missing**

This adds the `avatar_url` column to the profiles table if it doesn't exist.

**Status:** 🔧 Run only if you get column errors

---

### 4️⃣ Insert Dummy Data (Test Data)
**File:** `insert-dummy-data.sql` ✨ **UPDATED - Now includes fix!**

This adds all the test data:
- 4 user profiles
- 2 circles
- 10+ shifts
- 8 tasks
- 5 habits with logs
- 5 announcements
- 3 shift swaps

**Status:** ✅ Run this last (UPDATED VERSION includes avatar_url fix)

---

## 🎯 Quick Copy-Paste Order

In Supabase SQL Editor, run these files in order:

```
1. database-schema-updates.sql
2. quick-fix.sql
3. insert-dummy-data.sql (UPDATED VERSION)
```

## 🐛 Common Errors & Fixes

### Error: "policy already exists"
✅ **Fixed!** The updated `database-schema-updates.sql` now uses `DROP POLICY IF EXISTS`

### Error: "column avatar_url does not exist"
✅ **Fixed!** The updated `insert-dummy-data.sql` now adds the column automatically

Or run `fix-profiles-table.sql` first, then re-run `insert-dummy-data.sql`

### Error: "relation profiles does not exist"
❌ You skipped `quick-fix.sql` - Go back and run it!

### Error: "relation circles does not exist"
❌ You need to have the base schema. Make sure these tables exist:
- `circles`
- `circle_members`
- `shifts`
- `profiles`

Check your initial database setup or create these tables first.

---

## 📊 Verify Everything Worked

Run this query in Supabase to check:

```sql
-- Check all tables exist and have data
SELECT 'circles' as table_name, COUNT(*) as count FROM circles
UNION ALL
SELECT 'circle_members', COUNT(*) FROM circle_members
UNION ALL
SELECT 'shifts', COUNT(*) FROM shifts
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'personal_tasks', COUNT(*) FROM personal_tasks
UNION ALL
SELECT 'habits', COUNT(*) FROM habits
UNION ALL
SELECT 'habit_logs', COUNT(*) FROM habit_logs
UNION ALL
SELECT 'circle_announcements', COUNT(*) FROM circle_announcements
UNION ALL
SELECT 'shift_swaps', COUNT(*) FROM shift_swaps;
```

### Expected Results:
- **circles**: 2
- **circle_members**: 6-7
- **shifts**: 10+
- **profiles**: 4+
- **personal_tasks**: 8
- **habits**: 5
- **habit_logs**: 20+
- **circle_announcements**: 5
- **shift_swaps**: 3

---

## 🎉 All Done!

Once all scripts run successfully:
1. Go to http://localhost:3000
2. Sign up or log in
3. Explore all the test data!

---

## 🔄 Need to Start Over?

If you want to delete all dummy data and try again:

```sql
-- WARNING: This deletes ALL data!
DELETE FROM habit_logs;
DELETE FROM habits;
DELETE FROM personal_tasks;
DELETE FROM shift_swaps;
DELETE FROM circle_announcements;
DELETE FROM shifts WHERE circle_id IS NOT NULL;
DELETE FROM circle_members;
DELETE FROM circles;
-- Keep profiles as they're tied to auth.users
```

Then re-run `insert-dummy-data.sql`

---

## 💡 Pro Tip

The updated `insert-dummy-data.sql` is now **smart** and will:
- ✅ Check if `avatar_url` column exists
- ✅ Add it automatically if missing
- ✅ Continue without errors
- ✅ Work on fresh or existing databases

Just run it and it will handle everything! 🚀
