# 🎯 EASIEST WAY: Insert Dummy Data (3 Simple Steps!)

## The Problem
The script needs your user ID, but `auth.uid()` doesn't work in Supabase SQL Editor unless you're logged in through the Auth system.

## ✅ The Solution: Manual User ID Method

Follow these **3 EASY STEPS**:

---

## Step 1: Get Your User ID 🔑

In **Supabase SQL Editor**, run this query:

```sql
SELECT id, email FROM auth.users;
```

You'll see something like:
```
id: 12345678-abcd-1234-5678-123456789abc
email: youremail@example.com
```

**Copy your `id`** (the long UUID string)

---

## Step 2: Edit the Script ✏️

1. Open `insert-dummy-data-SIMPLE.sql` in VS Code
2. Find line ~20 that says:
   ```sql
   my_user_id UUID := 'PASTE-YOUR-USER-ID-HERE'::UUID;
   ```
3. Replace `'PASTE-YOUR-USER-ID-HERE'` with your actual ID:
   ```sql
   my_user_id UUID := '12345678-abcd-1234-5678-123456789abc'::UUID;
   ```
4. **Save the file** (Ctrl+S)

---

## Step 3: Run the Script 🚀

1. Copy the **entire contents** of `insert-dummy-data-SIMPLE.sql`
2. Paste into **Supabase SQL Editor**
3. Click **Run**
4. See success messages! ✓

---

## ✨ What You'll Get

After running the script, you'll have:

- ✅ **2 Circles**
  - Emergency Department Team (you're admin)
  - ICU Night Shift (you're admin)

- ✅ **10 Shifts**
  - 5 work shifts (linked to circles)
  - 5 personal activities

- ✅ **10 Tasks**
  - 8 pending (various priorities)
  - 2 completed

- ✅ **5 Habits**
  - Drink Water (8 glasses/day)
  - Exercise (30 min/day)
  - Meditation (daily)
  - Read Medical Journals (3x/week)
  - Sleep 7+ hours (daily)

- ✅ **36 Habit Logs**
  - 2 weeks of realistic tracking data

- ✅ **5 Announcements**
  - 3 for Emergency Dept
  - 2 for ICU

---

## 🎉 View Your Data

After the script runs successfully:

1. Go to **http://localhost:3000**
2. **Log in** with your account
3. Explore:
   - 🏠 **Dashboard** - See your overview
   - 🔵 **Circles** - View your 2 circles
   - 📅 **Scheduler** - See calendar with all shifts
   - 🌱 **Wellness** - Check tasks and habits

---

## 🐛 Troubleshooting

### Error: "Please edit the script and paste your actual user ID"
❌ You forgot Step 2! Edit the script and paste your user ID.

### Error: "User ID not found in auth.users table"
❌ You pasted the wrong ID or it has typos. Double-check it!

### Error: "column avatar_url does not exist"
✅ The script auto-adds it! If you see this, the script handles it automatically.

### Error: "circles with these names already exist"
✅ You already ran the script before! Either:
- Delete existing circles in Supabase
- Or change the circle names in the script

---

## 🔄 Need to Reset?

To delete all dummy data and start fresh:

```sql
-- Replace YOUR-USER-ID with your actual ID
DELETE FROM habit_logs WHERE user_id = 'YOUR-USER-ID';
DELETE FROM habits WHERE user_id = 'YOUR-USER-ID';
DELETE FROM personal_tasks WHERE user_id = 'YOUR-USER-ID';
DELETE FROM circle_announcements WHERE author_id = 'YOUR-USER-ID';
DELETE FROM shifts WHERE user_id = 'YOUR-USER-ID';
DELETE FROM circle_members WHERE user_id = 'YOUR-USER-ID';
DELETE FROM circles WHERE created_by = 'YOUR-USER-ID';
```

Then re-run the script!

---

## 📋 Quick Checklist

- [ ] Step 1: Get your user ID from `SELECT id, email FROM auth.users;`
- [ ] Step 2: Edit `insert-dummy-data-SIMPLE.sql` and paste your ID
- [ ] Step 3: Run the script in Supabase SQL Editor
- [ ] Step 4: Refresh your app at http://localhost:3000
- [ ] Step 5: Explore and test all features! 🎉

---

## 💡 Pro Tip

Save your user ID somewhere safe! You might need it for:
- Resetting data
- Testing queries
- Debugging issues

---

**That's it! Just 3 simple steps and you'll have a fully populated app to test!** 🚀
