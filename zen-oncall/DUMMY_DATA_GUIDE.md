# Dummy Data Setup Guide for Zen-OnCall

This guide will help you populate your database with test data to explore all features of the system.

## 📋 Prerequisites

Before running the dummy data script, make sure:
1. ✅ You've run `database-schema-updates.sql` to create all necessary tables
2. ✅ You've run `quick-fix.sql` to set up RLS policies and other fixes
3. ✅ You have at least one authenticated user (yourself) logged into the system

## 🚀 How to Insert Dummy Data

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on the **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Dummy Data Script
1. Open the file `insert-dummy-data.sql` in VS Code
2. Copy ALL the contents
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

### Step 3: Verify the Data
The script includes verification queries at the bottom that will show:
- All circles and member counts
- All shifts with user and circle information
- Personal tasks organized by user
- Habits with tracking statistics
- Circle announcements
- Shift swap requests
- Summary statistics

## 📊 What Data Will Be Created?

### 👥 Users (Profiles)
- **Dr. Sarah Johnson** (your current user)
- **Dr. Michael Chen**
- **Dr. Emily Rodriguez**
- **Dr. James Wilson**

### 🔵 Circles (2 Teams)
1. **Emergency Department Team**
   - Members: Sarah (admin), Michael, Emily
   - Focus: ER coordination and scheduling

2. **ICU Night Shift**
   - Members: Sarah (admin), Emily, James
   - Focus: Intensive care coordination

### 📅 Shifts (Multiple Types)
- **Work shifts**: ER shifts, ICU coverage, on-call rotations
- **Personal activities**: Gym sessions, family dinners
- Color-coded by category
- Scheduled across the next week

### ✅ Personal Tasks (8+ tasks)
- High priority: Medical charts, team meeting prep
- Medium priority: Grocery shopping, insurance calls, meal prep
- Low priority: Journal review, dentist appointment
- Mix of completed and pending tasks
- Different categories: personal, errand, meal

### 🎯 Habits (5 habits with tracking)
1. **Drink Water** - 8 glasses/day target
2. **Exercise** - 30 minutes daily
3. **Meditation** - Daily mindfulness practice
4. **Read Medical Journals** - 3x per week
5. **Sleep 7+ hours** - Daily rest tracking

Each habit includes 4-7 days of historical tracking data!

### 📢 Circle Announcements (5 posts)
- Schedule changes
- Protocol updates (urgent priority)
- Team social events
- Equipment maintenance notices
- Team appreciation posts

### 🔄 Shift Swaps (3 requests)
- 1 pending request
- 1 accepted swap
- 1 declined request

## 🔍 Testing Different Features

### Test the Dashboard
```
Navigate to: /dashboard
You should see:
- Overview of upcoming shifts
- Pending tasks
- Habit streaks
- Quick stats
```

### Test Circles
```
Navigate to: /circles
You should see:
- Emergency Department Team
- ICU Night Shift
- Click on any circle to see members, schedule, and announcements
```

### Test the Scheduler
```
Navigate to: /scheduler
You should see:
- Calendar view with all shifts
- Color-coded categories
- Your shifts and circle members' shifts
- Ability to add new shifts
```

### Test Wellness Features
```
Navigate to: /wellness
You should see:
- Personal tasks list
- Habit tracker with completion data
- Charts showing progress
- Ability to log new habit completions
```

### Test Circle Features (Inside a Circle)
```
Navigate to: /circles/[circleId]
You should see:
- Member list with avatars
- Shared calendar
- Announcements feed
- Shift swap requests
- Ability to post new announcements
```

## 🧪 Additional Testing Ideas

### Test User Interactions
1. **Create a new shift** and see if it appears in the calendar
2. **Mark a task as complete** and watch it update
3. **Log a habit** for today and see the streak update
4. **Post an announcement** in a circle
5. **Request a shift swap** with another user

### Test Privacy Settings
1. Go to a circle's member settings
2. Toggle "share_shifts" and "share_status"
3. Verify that other members' data visibility changes

### Test Filters and Search
1. Filter tasks by category (personal, errand, meal)
2. Filter shifts by circle
3. Search for specific announcements

## 📝 Important Notes

⚠️ **User ID Mapping**: The script uses placeholder UUIDs for test users. The system will map them correctly based on your actual authenticated user.

⚠️ **Dates**: All shifts and tasks are created relative to the current date, so they'll always be relevant.

⚠️ **RLS Security**: All data respects Row Level Security policies, so users can only see what they're supposed to see.

## 🔄 Reset Data (If Needed)

If you want to clear all dummy data and start fresh:

```sql
-- WARNING: This deletes ALL data!
DELETE FROM habit_logs;
DELETE FROM habits;
DELETE FROM personal_tasks;
DELETE FROM shift_swaps;
DELETE FROM circle_announcements;
DELETE FROM shifts;
DELETE FROM circle_members;
DELETE FROM circles;
-- Profiles are tied to auth.users, so leave them
```

## 🎉 Next Steps

After inserting dummy data:
1. ✨ Explore each page of the application
2. 🧪 Test creating, editing, and deleting data
3. 👥 Test multi-user interactions (if you have multiple accounts)
4. 📱 Test responsive design on mobile
5. 🐛 Look for any bugs or UI issues

## 💡 Tips for Demo/Presentation

- The data is realistic and healthcare-themed (doctors, ER, ICU)
- Shows a full week of activity and planning
- Demonstrates collaboration features (circles, announcements, swaps)
- Includes both completed and pending items for visual variety
- Color-coded for easy visual understanding

Enjoy testing your Zen-OnCall system! 🚀
