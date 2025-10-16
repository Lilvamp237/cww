# 🚀 Quick Start: Testing Zen-OnCall with Dummy Data

Follow these steps to get your system up and running with test data!

## Step 1: Ensure Your Environment is Ready ✅

Make sure you have:
- Node.js installed (v18 or higher)
- npm or yarn package manager
- A Supabase account with a project set up
- Your Supabase credentials (URL and anon key)

## Step 2: Install Dependencies 📦

Open a terminal in VS Code and run:

```bash
npm install
```

This will install all the required packages for your Next.js application.

## Step 3: Set Up Environment Variables 🔐

1. Create a `.env.local` file in the root directory (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**To find these values:**
- Go to your Supabase project dashboard
- Click on **Settings** (gear icon) → **API**
- Copy the **Project URL** and **anon/public** key

## Step 4: Set Up the Database Schema 🗄️

Go to your Supabase dashboard:

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**

### Run these scripts IN ORDER:

#### A. First, run `database-schema-updates.sql`
- Copy the entire contents of `database-schema-updates.sql`
- Paste into SQL Editor
- Click **Run**
- Wait for "Success" message

#### B. Then, run `quick-fix.sql`
- Copy the entire contents of `quick-fix.sql`
- Paste into SQL Editor
- Click **Run**
- Wait for "Success" message

## Step 5: Insert Dummy Data 📊

Still in the Supabase SQL Editor:

1. Copy the entire contents of `insert-dummy-data.sql`
2. Paste into a new query in SQL Editor
3. Click **Run**
4. You should see success messages and verification results

**What you should see:**
- Circles created confirmation
- Summary statistics showing counts for all data types
- Verification tables showing sample data

## Step 6: Start the Development Server 🌐

Back in VS Code terminal, run:

```bash
npm run dev
```

You should see output like:
```
✓ Ready in 2.3s
○ Local:    http://localhost:3000
```

## Step 7: Open the Application 🎉

1. Open your browser
2. Go to **http://localhost:3000**
3. You should see the Zen-OnCall home page

## Step 8: Sign Up / Log In 👤

1. Click **Sign Up** or **Log In**
2. Create an account using your email
3. Check your email for verification link (if required)
4. Once logged in, you'll be redirected to the dashboard

## Step 9: Explore the Features! 🔍

### 🏠 Dashboard (`/dashboard`)
- See your overview stats
- View upcoming shifts
- Check pending tasks
- Monitor habit streaks

### 🔵 Circles (`/circles`)
You should see two test circles:
- **Emergency Department Team** (3 members)
- **ICU Night Shift** (3 members)

Click on a circle to:
- View all members with avatars
- See the shared calendar
- Read announcements (5 sample posts)
- Check shift swap requests

### 📅 Scheduler (`/scheduler`)
- Calendar view with all shifts
- Color-coded by category (work vs personal)
- Your shifts plus circle members' shifts
- Click dates to add new shifts

### 🌱 Wellness (`/wellness`)
You should see:
- **8 personal tasks** (mix of pending and completed)
  - Medical charts (high priority)
  - Grocery shopping (medium)
  - Dentist appointment (low)
  - And more...

- **5 habits with tracking data:**
  - 💧 Drink Water (8 glasses/day)
  - 🏃 Exercise (30 min/day)
  - 🧘 Meditation (daily)
  - 📚 Read Medical Journals (3x/week)
  - 😴 Sleep 7+ hours (daily)

- **Progress charts** showing your tracking over the past week

### 🩺 Diagnostics (`/diagnostics`)
- System health checks
- Database connection status
- User session information

## Step 10: Test Interactions 🧪

Try these actions to see everything work:

### ✅ Test Tasks
1. Go to **Wellness** tab
2. Check off a pending task
3. Add a new task
4. Edit task details
5. Delete a task

### 🎯 Test Habits
1. Go to **Wellness** → **Habits**
2. Log today's progress for "Drink Water"
3. See the streak update
4. View the progress chart
5. Add a new habit

### 📅 Test Shifts
1. Go to **Scheduler**
2. Click on a future date
3. Add a new shift (work or personal)
4. See it appear on the calendar
5. Edit or delete a shift

### 👥 Test Circle Features
1. Go to **Circles**
2. Click on "Emergency Department Team"
3. View all members
4. Read the announcements
5. Post a new announcement
6. Check shift swap requests

### 🔄 Test Shift Swaps
1. Inside a circle, go to shift swaps
2. See the pending request from Dr. Michael Chen
3. Accept or decline the request
4. Create your own swap request

## 🐛 Troubleshooting

### "No data showing up"
- Make sure you ran all SQL scripts in order
- Check that you're logged in with the same email
- Verify in Supabase SQL Editor:
  ```sql
  SELECT * FROM profiles WHERE id = auth.uid();
  ```

### "Database connection error"
- Double-check your `.env.local` file
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Restart the dev server after adding env vars

### "Can't see other users' data"
- This is expected! RLS (Row Level Security) is enabled
- You can only see:
  - Your own tasks and habits
  - Circle data for circles you're a member of
  - Other members' shifts (if they have sharing enabled)

### "No circles showing"
- Verify circle_members table has your user_id:
  ```sql
  SELECT * FROM circle_members WHERE user_id = auth.uid();
  ```
- If empty, the dummy data script may need your actual user ID

### Need to Reset Everything?
```sql
-- Run in Supabase SQL Editor (WARNING: Deletes all data!)
DELETE FROM habit_logs;
DELETE FROM habits;
DELETE FROM personal_tasks;
DELETE FROM shift_swaps;
DELETE FROM circle_announcements;
DELETE FROM shifts;
DELETE FROM circle_members;
DELETE FROM circles;
```

Then re-run `insert-dummy-data.sql`

## 📊 What to Expect

After following all steps, you should have:

- ✅ A running Next.js application on http://localhost:3000
- ✅ 4 test user profiles (including yours)
- ✅ 2 circles with multiple members each
- ✅ 10+ shifts across different users and circles
- ✅ 8 personal tasks with various priorities
- ✅ 5 habits with a week of tracking data
- ✅ 5 circle announcements
- ✅ 3 shift swap requests (pending, accepted, declined)

## 🎯 Demo Scenario

Here's a suggested flow for testing/demoing:

1. **Login** → See personalized dashboard
2. **Dashboard** → Overview of your schedule and wellness
3. **Wellness** → Check off some tasks, log habit progress
4. **Scheduler** → View calendar, add a new shift
5. **Circles** → 
   - View Emergency Department Team
   - Read announcements
   - See team schedule
   - Accept a shift swap request
6. **Post an announcement** → Test real-time updates
7. **Create a shift swap** → Request a trade with another user

## 🌟 Advanced Testing

### Test Privacy Settings
1. Go to a circle's settings
2. Toggle "Share Shifts" off
3. Your shifts should disappear from circle calendar for others

### Test Filters
1. Filter tasks by category (personal, errand, meal)
2. Filter tasks by priority (high, medium, low)
3. Filter shifts by circle

### Test Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes

### Test Real-time Features
1. Open the app in two different browsers
2. Post an announcement in one
3. See if it appears in the other (may need refresh)

## 🎉 Success!

You now have a fully populated Zen-OnCall system to explore and test!

For more details about the dummy data, see `DUMMY_DATA_GUIDE.md`

Happy testing! 🚀
