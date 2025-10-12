# Testing Guide - New Features

## 🚦 Before You Start

### 1. Run Database Migration
Open Supabase SQL Editor and execute the entire contents of:
```
database-schema-updates.sql
```

This will create all necessary tables and security policies.

### 2. Install Dependencies (if needed)
```bash
npm install @radix-ui/react-tabs --legacy-peer-deps
```

### 3. Start Development Server
```bash
npm run dev
```

---

## 📝 Testing Checklist

### Feature 1: Smart Scheduler

#### A. Quick Add Feature
- [ ] Go to `/scheduler`
- [ ] In the quick-add box, type: `Shift 09:00 17:00`
- [ ] Click "Add" - should create a shift
- [ ] Type: `Buy groceries`
- [ ] Click "Add" - should create a task

#### B. Work Tab
- [ ] Click "Work" tab
- [ ] Click "+ Add Shift" button
- [ ] Fill in shift details (title, times, color, notes)
- [ ] Save and verify it appears in calendar
- [ ] Click a date with a shift - should see shift details
- [ ] Edit a shift - change time or color
- [ ] Delete a shift - confirm deletion dialog works

#### C. Personal Tab
- [ ] Click "Personal" tab
- [ ] Click "+ Add Task" button
- [ ] Fill in task details (title, description, priority, category, time)
- [ ] Save and verify it appears
- [ ] Click the checkbox to complete a task
- [ ] Task should show as completed (strikethrough)
- [ ] Edit and delete tasks

#### D. Habits
- [ ] Click "+ Add Habit" button (top right)
- [ ] Create a habit: "Drink water", daily, target 8
- [ ] Save habit
- [ ] On Personal tab, click on habit card to log it
- [ ] Counter should increase (1/8, 2/8, etc.)
- [ ] When target reached, card should turn green

#### E. All Tab
- [ ] Click "All" tab
- [ ] Should see both shifts and tasks together
- [ ] Calendar should show both blue (shifts) and green (tasks) indicators
- [ ] Verify all features work in combined view

---

### Feature 2: Sync Circles

#### A. Create/Join Circle
- [ ] Go to `/circles`
- [ ] Create a new circle or join existing one
- [ ] Navigate to circle detail page

#### B. Privacy Settings
- [ ] Click "Manage Privacy" button
- [ ] Toggle "Share My Shifts" off
- [ ] Save settings
- [ ] Have another user check - they shouldn't see your shifts
- [ ] Toggle back on and verify shifts appear again

#### C. Team Schedule
- [ ] Click "Schedule" tab
- [ ] Add some shifts in the scheduler (if you haven't)
- [ ] Return to circle page
- [ ] Your shifts should appear under your name
- [ ] If other members have shifts, they should appear too
- [ ] Each member's shifts are grouped together
- [ ] Shifts show time and color-coded borders

#### D. Announcements
- [ ] Click "Announcements" tab
- [ ] Click "Post Announcement" button
- [ ] Fill in:
   - Title: "Team Meeting"
   - Content: "Weekly sync at 2pm Friday"
   - Priority: "High"
- [ ] Post announcement
- [ ] Should appear in feed with your name and timestamp
- [ ] Priority badge should show "high"
- [ ] Other circle members should see it too

#### E. Shift Swaps
- [ ] Make sure you have at least one upcoming shift
- [ ] Click "Shift Swaps" tab
- [ ] Click "Request Swap" button
- [ ] Select one of your shifts from dropdown
- [ ] Add message: "Need coverage, doctor appointment"
- [ ] Submit request
- [ ] Should appear in feed with "pending" status

**As Another User:**
- [ ] Log in with different account (same circle)
- [ ] Go to circle's "Shift Swaps" tab
- [ ] See the swap request
- [ ] Click "Accept" or "Decline"
- [ ] Add response message
- [ ] Status should update

**Back to Original User:**
- [ ] Refresh page
- [ ] Should see status changed to "accepted" or "declined"
- [ ] Should see response message

---

## 🎯 Expected Results

### Scheduler
- ✅ Three working tabs (All, Work, Personal)
- ✅ Calendar shows colored indicators
- ✅ Shifts can be created, edited, deleted
- ✅ Tasks can be created, completed, edited, deleted
- ✅ Habits can be created and logged
- ✅ Quick-add parses text correctly
- ✅ All data persists in database

### Circles
- ✅ Privacy controls work
- ✅ Team schedule shows all members' shifts
- ✅ Announcements post and display correctly
- ✅ Shift swaps can be requested and responded to
- ✅ All features respect privacy settings
- ✅ Data updates in real-time

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@radix-ui/react-tabs'"
**Solution:** Run `npm install @radix-ui/react-tabs --legacy-peer-deps`

### Issue: Database errors on first use
**Solution:** Make sure you ran `database-schema-updates.sql` in Supabase

### Issue: "User not authenticated" errors
**Solution:** Log out and log back in to refresh session

### Issue: Calendar doesn't show colored dates
**Solution:** 
1. Add shifts/tasks to future dates
2. Check that dates are after today
3. Try selecting different tabs (Work/Personal/All)

### Issue: Shifts not showing in circle schedule
**Solution:** 
1. Check privacy settings - "Share My Shifts" should be ON
2. Make sure shifts are in the next 30 days
3. Refresh the page

### Issue: Can't post announcements
**Solution:** Verify you're a member of the circle (check members list)

---

## 📸 Screenshots to Take (for documentation)

1. Scheduler - All tab with mixed shifts and tasks
2. Scheduler - Work tab showing shifts only
3. Scheduler - Personal tab with tasks and habits
4. Scheduler - Quick-add bar with example
5. Circles - Team schedule with multiple members
6. Circles - Announcements feed
7. Circles - Shift swap request dialog
8. Circles - Privacy settings dialog

---

## 🎉 Success Criteria

The features are working correctly if:
- [x] All 8 todos marked complete
- [ ] No console errors
- [ ] Data persists after page refresh
- [ ] Multiple users can interact (announcements, swaps)
- [ ] Privacy settings are respected
- [ ] UI is responsive and smooth
- [ ] All buttons and forms work as expected

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify all migrations ran successfully
4. Check that user is authenticated
5. Try in incognito mode to rule out cache issues

---

## ✨ Bonus Features to Explore

1. **Color Coding:** Try different colors for shifts - they'll appear on the calendar!
2. **Priority Tasks:** Create high-priority tasks - they show red badges
3. **Habit Streaks:** Log habits multiple days in a row
4. **Urgent Announcements:** Post with "urgent" priority - red badge
5. **Multi-Circle:** Join multiple circles and see how privacy works per-circle

Happy testing! 🚀
