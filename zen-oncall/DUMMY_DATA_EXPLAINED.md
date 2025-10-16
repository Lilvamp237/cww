# 🎯 IMPORTANT: Choose Your Dummy Data Approach

## ⚠️ The Problem

The original `insert-dummy-data.sql` tries to create **fake users** that don't exist in Supabase Auth. This causes a foreign key constraint error because:

- Profiles table requires users to exist in `auth.users` table
- You can't create auth users through SQL (must use Supabase Auth API)
- Dummy user IDs don't exist in the auth system

## ✅ Solution: Use the REALISTIC Version

I've created **`insert-dummy-data-REALISTIC.sql`** which:
- ✅ Uses YOUR actual logged-in user
- ✅ Creates circles and data for YOU
- ✅ No fake users = no foreign key errors
- ✅ Works immediately after login

---

## 🚀 How to Use the Realistic Version

### Step 1: Log into Your Application
1. Go to http://localhost:3000
2. Sign up or log in with your account
3. Make sure you're authenticated

### Step 2: Run the Script in Supabase
1. Go to Supabase SQL Editor
2. Open `insert-dummy-data-REALISTIC.sql` in VS Code
3. Copy ALL contents
4. Paste into Supabase SQL Editor
5. Click **Run**

### Step 3: See Your Data!
The script will create **for YOUR user**:
- ✅ **2 circles** (Emergency Dept + ICU) - you're the admin
- ✅ **10 shifts** (5 work + 5 personal)
- ✅ **10 tasks** (8 pending + 2 completed)
- ✅ **5 habits** with 2 weeks of tracking data
- ✅ **5 announcements** in your circles

---

## 📊 What You'll Get

### Your Circles (You're Admin of Both)
1. **Emergency Department Team**
   - You as admin/only member (for now)
   - 3 announcements
   - Several work shifts

2. **ICU Night Shift**
   - You as admin/only member (for now)
   - 2 announcements
   - Several work shifts

### Your Shifts (10 Total)
**Work Shifts (5):**
- ER Night Shift (tomorrow)
- Morning Rounds (in 2 days)
- ER Day Shift (in 4 days)
- ICU Night Coverage (in 3 days)
- ICU Weekend On-Call (in 6 days)

**Personal Time (5):**
- Gym Session
- Dinner with Family
- Yoga Class
- Study Time
- Meal Prep Sunday

### Your Tasks (10 Total)
**Pending (8):**
- Complete medical charts (high priority, tomorrow)
- Grocery shopping (medium, 2 days)
- Team meeting prep (high, 3 days)
- Call insurance (medium, tomorrow)
- Pack lunch (medium, today)
- Review journals (low, 4 days)
- Schedule dentist (low, 5 days)
- Order supplies (medium, 3 days)

**Completed (2):**
- Updated certifications ✓
- Annual physical ✓

### Your Habits (5)
1. 💧 **Drink Water** - 8 glasses/day (14 days logged)
2. 🏃 **Exercise** - 30 min/day (10 days logged)
3. 🧘 **Meditation** - Daily practice (12 days logged)
4. 📚 **Read Medical Journals** - 3x/week
5. 😴 **Sleep 7+ hours** - Daily

---

## 🎯 Benefits of Realistic Version

### ✅ Pros:
- **No foreign key errors** - uses real auth users
- **Immediate testing** - works right after login
- **Single-user focused** - perfect for initial development
- **Real data flow** - see how it works for actual users
- **Safe and clean** - no fake data in auth tables

### ⚠️ Limitations:
- Only creates data for YOU (no other members yet)
- Circles will show only you as a member initially
- No shift swap demo (requires multiple users)
- Can't test multi-user interactions yet

---

## 🔄 Want to Add More Users Later?

### Option 1: Invite Real Users
1. Have friends/team members sign up
2. Invite them to your circles
3. They can add their own shifts/data

### Option 2: Create Test Accounts Manually
1. Sign up multiple test accounts through the app
2. Log in as each one
3. Run a modified version of the script for each
4. Add them to each other's circles

### Option 3: Use Supabase Auth Admin API
(Advanced - requires backend code)
```javascript
// Create test users programmatically
const { data, error } = await supabase.auth.admin.createUser({
  email: 'test@example.com',
  password: 'test123456',
  email_confirm: true
})
```

---

## 📝 File Comparison

| Feature | Original | Realistic |
|---------|----------|-----------|
| Fake users | 4 | 0 |
| Real users | 1 | 1 (you) |
| Circles | 2 | 2 |
| Total shifts | 10+ | 10 |
| Tasks | 8 | 10 |
| Habits | 5 | 5 |
| Habit logs | 20+ | 36 |
| Announcements | 5 | 5 |
| Shift swaps | 3 | 0 |
| **Works?** | ❌ No | ✅ Yes |

---

## 🎉 Recommended Steps

### Right Now (Development):
1. ✅ Use **`insert-dummy-data-REALISTIC.sql`**
2. ✅ Test all features with your own data
3. ✅ Verify everything works for single user
4. ✅ Polish the UI and features

### Later (Testing/Production):
1. Create real test accounts through signup
2. Invite users to circles
3. Test multi-user features
4. Add real data

---

## 🚀 Quick Start Command

```bash
# 1. Make sure your app is running
npm run dev

# 2. Log in at http://localhost:3000

# 3. Run this in Supabase SQL Editor:
#    insert-dummy-data-REALISTIC.sql

# 4. Refresh your app and explore!
```

---

## ✨ Bottom Line

**Use `insert-dummy-data-REALISTIC.sql`** - it's designed specifically to work with Supabase's authentication system and will give you plenty of realistic data to test with!

The original version with fake users won't work because you can't create auth users through SQL. This realistic version solves that by using your actual logged-in user. 🎯
