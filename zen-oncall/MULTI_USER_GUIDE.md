# 🎉 Multi-User Dummy Data - Ready to Go!

## ✨ Your 4 User IDs Are Already Set!

The script **`insert-dummy-data-4-USERS.sql`** is pre-configured with your user IDs:

1. `5614df0a-5d61-4a3b-b68f-85ad5d75c08f` → **Dr. Sarah Johnson** (Admin)
2. `33f7ecd3-a97e-4a3c-a543-b79ef104bc6b` → **Dr. Michael Chen** (Member)
3. `03e3b097-6bcb-4bd7-bad9-60f4769563fe` → **Dr. Emily Rodriguez** (Member)
4. `10eabe70-4d2c-4751-8e51-a3c95c6c941b` → **Dr. James Wilson** (Member)

---

## 🚀 How to Use (Just 1 Step!)

### Run the Script in Supabase:

1. Open `insert-dummy-data-4-USERS.sql` in VS Code
2. Copy **ALL** the contents
3. Paste into **Supabase SQL Editor**
4. Click **Run**
5. Done! ✨

---

## 📊 What You'll Get

### 👥 4 User Profiles
- **Dr. Sarah Johnson** - Admin of both circles
- **Dr. Michael Chen** - Member of Emergency Dept
- **Dr. Emily Rodriguez** - Member of both circles
- **Dr. James Wilson** - Member of both circles (status private)

### 🔵 2 Circles (Teams)

**1. Emergency Department Team** (4 members)
- Sarah (admin)
- Michael (member)
- Emily (member)
- James (member - keeps status private)

**2. ICU Night Shift** (3 members)
- Sarah (admin)
- Emily (member)
- James (member)

### 📅 15 Shifts Across All Users

**Dr. Sarah (4 shifts):**
- ER Night Shift (tomorrow)
- Morning Rounds (in 3 days)
- ICU Night Coverage (in 5 days)
- Yoga Class (personal)

**Dr. Michael (3 shifts):**
- ER Day Shift (in 2 days)
- On-Call Weekend (in 6 days)
- Basketball Game (personal)

**Dr. Emily (4 shifts):**
- ICU Day Shift (tomorrow)
- ER Backup (in 4 days)
- ICU Night (in 7 days)
- Book Club (personal)

**Dr. James (3 shifts):**
- ICU Weekend (in 5 days)
- ER Evening (in 2 days)
- Guitar Practice (personal)

### ✅ Personal Data (for Sarah only)
- 5 tasks (4 pending, 1 completed)
- 3 habits (Water, Exercise, Meditation)
- 11 habit logs (past week tracking)

### 📢 6 Circle Announcements
From different users showing team collaboration:
- Welcome message (Sarah)
- Schedule changes (Michael)
- COVID protocol update - URGENT (Sarah)
- Equipment maintenance (Emily)
- Team appreciation (Sarah)
- Coffee run invite (James)

### 🔄 3 Shift Swap Requests
1. **Pending**: Michael → Sarah (waiting for response)
2. **Accepted**: Sarah → Emily (swap confirmed)
3. **Declined**: Emily → James (couldn't help)

---

## 🎯 Testing Scenarios

### Log in as Different Users to Test:

#### 1️⃣ Log in as User 1 (Dr. Sarah - Admin)
- ✅ See both circles (you're admin)
- ✅ See all 4 members in Emergency Dept
- ✅ See 3 members in ICU
- ✅ View all announcements
- ✅ See pending shift swap from Michael
- ✅ Accept or decline the swap request
- ✅ Your tasks and habits visible
- ✅ See everyone's shifts in the calendar

#### 2️⃣ Log in as User 2 (Dr. Michael - Member)
- ✅ See Emergency Dept circle
- ✅ Can post announcements
- ✅ Your pending shift swap visible
- ✅ See other members' shifts
- ✅ Can request shift swaps

#### 3️⃣ Log in as User 3 (Dr. Emily - Member)
- ✅ See both circles
- ✅ View accepted shift swap with Sarah
- ✅ See your declined request to James
- ✅ Post announcements in both circles

#### 4️⃣ Log in as User 4 (Dr. James - Member)
- ✅ See both circles
- ✅ Status is private (share_status = FALSE)
- ✅ Can view others' shifts
- ✅ Declined Emily's request visible

---

## 🧪 What to Test

### Multi-User Features:
- [ ] **Circle Members**: See all 4 users with avatars
- [ ] **Shared Calendar**: View shifts from all team members
- [ ] **Announcements**: Different authors posting updates
- [ ] **Shift Swaps**: Requests between users
- [ ] **Privacy Settings**: James's status is hidden
- [ ] **Roles**: Admin (Sarah) vs Members (others)

### Single-User Features:
- [ ] **Personal Dashboard**: Your shifts and stats
- [ ] **Tasks**: Create, complete, delete
- [ ] **Habits**: Log progress, view streaks
- [ ] **Scheduler**: Add personal and work shifts

### Collaboration Features:
- [ ] **Post Announcement**: Add new message to circle
- [ ] **Respond to Swap**: Accept/decline Michael's request
- [ ] **Request Swap**: Create new swap request
- [ ] **View Team Schedule**: See who's on when

---

## 📋 Calendar Preview (Next 7 Days)

```
Day 1 (Tomorrow):
  - Sarah: ER Night Shift
  - Emily: ICU Day Shift
  - James: Guitar Practice (personal)

Day 2:
  - Michael: ER Day Shift
  - Sarah: Yoga Class (personal)
  - James: ER Evening

Day 3:
  - Sarah: Morning Rounds
  - Emily: Book Club (personal)

Day 4:
  - Emily: ER Backup
  - Michael: Basketball Game (personal)

Day 5:
  - Sarah: ICU Night Coverage
  - James: ICU Weekend

Day 6:
  - Michael: On-Call Weekend (starts)

Day 7:
  - Emily: ICU Night
  - Michael: On-Call Weekend (continues)
```

---

## 🎨 Visual Team Structure

```
Emergency Department Team (4 members)
├─ 👨‍⚕️ Dr. Sarah Johnson (Admin) ⭐
├─ 👨‍⚕️ Dr. Michael Chen (Member)
├─ 👩‍⚕️ Dr. Emily Rodriguez (Member)
└─ 👨‍⚕️ Dr. James Wilson (Member) 🔒

ICU Night Shift (3 members)
├─ 👨‍⚕️ Dr. Sarah Johnson (Admin) ⭐
├─ 👩‍⚕️ Dr. Emily Rodriguez (Member)
└─ 👨‍⚕️ Dr. James Wilson (Member) 🔒

🔒 = Status private
⭐ = Admin
```

---

## ✨ Pro Tips

### 1. Test Admin Features (Log in as Sarah)
- Add/remove members
- Edit circle details
- Manage announcements

### 2. Test Member Interactions
- Log in as different users
- See how data visibility changes
- Test privacy settings

### 3. Test Real-Time Collaboration
- Open app in 2 browsers
- Log in as different users
- Post announcement in one
- Refresh the other to see it

### 4. Test Shift Swaps
- Accept Michael's pending request (as Sarah)
- Create new swap requests
- See how status updates

---

## 🔄 Need to Reset?

To delete all dummy data:

```sql
DELETE FROM habit_logs;
DELETE FROM habits;
DELETE FROM personal_tasks;
DELETE FROM shift_swaps;
DELETE FROM circle_announcements;
DELETE FROM shifts;
DELETE FROM circle_members;
DELETE FROM circles;
-- Profiles stay (tied to auth.users)
```

Then re-run the script!

---

## 🎉 You're All Set!

**Just run the script and you'll have:**
- ✅ 4 realistic users with profiles
- ✅ 2 active circles with real memberships
- ✅ 15 shifts showing team coordination
- ✅ 6 announcements from different people
- ✅ 3 shift swap requests in various states
- ✅ Personal data (tasks, habits) for testing

**Perfect for testing all collaboration features!** 🚀

Log in as any of your 4 users and start exploring!
