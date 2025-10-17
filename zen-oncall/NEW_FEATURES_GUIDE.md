# 🚀 QUICK START: New Features Guide

## How to Use Your 3 New Features

---

## 🔔 Notifications System

### Access:
- Click the **🔔 bell icon** in the navbar
- Badge shows unread count (e.g., "3")
- Or navigate to: `http://localhost:3000/notifications`

### What You'll See:
```
┌─────────────────────────────────────┐
│  📊 Total: 15  |  🔶 Unread: 3     │
├─────────────────────────────────────┤
│ [All] [Unread]  [Mark All Read] ⚡ │
├─────────────────────────────────────┤
│ 🔵 Shift Reminder          [New]   │
│ Your shift starts in 1 hour...     │
│ 📍 5 minutes ago          [✓] [🗑️] │
├─────────────────────────────────────┤
│ 💪 Wellness Reminder               │
│ You've had 3 late shifts...        │
│ 📍 2 hours ago            [✓] [🗑️] │
└─────────────────────────────────────┘
```

### Actions:
- **Mark as Read**: Click the ✓ circle icon
- **Delete**: Click the 🗑️ trash icon
- **Mark All Read**: Top right button
- **Clear Read**: Removes all read notifications
- **Filter**: Switch between "All" and "Unread" tabs

### Notification Types:
- 🔵 **Shift** - Shift reminders and updates
- 💼 **Task** - Task due date reminders
- 💪 **Wellness** - Wellness check-in nudges
- ⚠️ **Fatigue** - Fatigue alerts (< 6 hours sleep)
- 👥 **Circle** - Team updates and announcements
- 🏆 **Achievement** - New badges earned
- 🔔 **Reminder** - General reminders

---

## ✨ Routine Recommender (For You)

### Access:
- Click **"For You" ✨** in the navbar
- Or navigate to: `http://localhost:3000/recommendations`

### What You'll See:
```
┌───────────────────────────────────────────────┐
│  ✨ Personal Recommendations                  │
│  [Generate New] button                        │
├───────────────────────────────────────────────┤
│  📊 Your Patterns (Last 30 Days)              │
│  ├─ Avg Sleep: 5.2h ⚠️                       │
│  ├─ Avg Energy: 2.5/5 ⚠️                     │
│  ├─ Weekly Hours: 52h ⚠️                     │
│  └─ Mood Trend: declining ↓                  │
├───────────────────────────────────────────────┤
│  💡 Your Recommendations (5)                  │
├───────────────────────────────────────────────┤
│  😴 Prioritize Sleep Tonight        [HIGH]   │
│  Your average sleep is 5.2h. Aim for 7-9h.   │
│  💡 Chronic sleep deprivation detected        │
│  [Take Action →]                              │
├───────────────────────────────────────────────┤
│  🛋️ Schedule a Day Off              [HIGH]   │
│  You've worked 7 consecutive days...         │
│  💡 Extended work period without break        │
│  [Take Action →]                              │
└───────────────────────────────────────────────┘
```

### How It Works:
1. **Analyzes 30 Days** of your data automatically
2. **Detects Patterns**:
   - Sleep duration and quality
   - Mood trends (improving/stable/declining)
   - Work hours and consecutive days
   - Energy levels
   - Night shift vs day shift impact

3. **Generates Smart Recommendations**:
   - 🛋️ **Rest** - Take breaks, schedule days off
   - 🏃‍♀️ **Exercise** - Light walks, movement
   - 👥 **Social** - Connect with friends/family
   - 🥗 **Nutrition** - Plan healthy meals
   - 😴 **Sleep** - Prioritize sleep tonight
   - 🧘 **Mindfulness** - Breathing exercises
   - 📋 **Task** - Organize pending tasks

4. **Priority Levels**:
   - 🔴 **HIGH** - Immediate action needed
   - 🟡 **MEDIUM** - Important but not urgent
   - 🟢 **LOW** - Nice to have

### Usage Tips:
- Click **"Generate New"** to refresh (analyzes latest data)
- Click **"Take Action"** to go directly to relevant page
- Recommendations expire after 24 hours (automatically refresh)
- Works best with 7+ days of mood/sleep/shift data

---

## 📊 Analytics Dashboard

### Access:
- Click **"Analytics" 📊** in the navbar
- Or navigate to: `http://localhost:3000/analytics`

### What You'll See:
```
┌──────────────────────────────────────────────────┐
│  📊 Analytics Dashboard                          │
│  [Last 30 days ▼] [Custom] [Export CSV]         │
├──────────────────────────────────────────────────┤
│  📈 Summary Stats                                │
│  ├─ Avg Mood: 3.8/5 ↑                          │
│  ├─ Avg Energy: 3.2/5 ↑                        │
│  ├─ Avg Sleep: 6.5h ↓                          │
│  ├─ Work Hours: 45h                            │
│  ├─ Tasks Done: 12/15                          │
│  └─ Completion: 80% ↑                          │
├──────────────────────────────────────────────────┤
│  [Mood & Energy] [Sleep] [Workload] [Correlations]│
├──────────────────────────────────────────────────┤
│  📈 Interactive Chart Here                       │
│  (Line/Bar/Area charts based on tab)            │
└──────────────────────────────────────────────────┘
```

### Features:

#### 1. **Date Range Selector**
- **Last 7 days** - Recent trends
- **Last 30 days** - Monthly overview
- **Last 90 days** - Long-term patterns
- **Custom** - Pick your own start/end dates

#### 2. **4 Chart Views**
- **Mood & Energy** 📈
  - Dual-line chart
  - Track emotional wellbeing
  - See mood and energy trends together

- **Sleep Analysis** 😴
  - Bar chart: Sleep hours
  - Line chart: Sleep quality (/5)
  - Identify sleep patterns

- **Workload** 💼
  - Bar chart of daily work hours
  - Spot overwork periods
  - Balance work-life

- **Correlations** 🔄
  - Area chart: Work hours
  - Line chart: Mood score
  - See how work affects mood

#### 3. **Export to CSV**
- Click **"Export CSV"** button
- Downloads all data for external analysis
- Includes: date, mood, energy, sleep, work hours
- Open in Excel/Google Sheets

### Usage Tips:
- **Hover over charts** to see exact values
- **Compare periods** by changing date range
- **Look for patterns**:
  - Does mood drop after night shifts?
  - Sleep less on busy weeks?
  - Energy lower on certain days?
- **Export data** for deeper analysis

---

## 🎯 Putting It All Together

### Morning Routine:
1. Check **Notifications** 🔔
   - Any shifts today?
   - Tasks due?
   - New achievements?

2. View **Recommendations** ✨
   - What does AI suggest?
   - Any high-priority actions?
   - Schedule recommended activities

3. Check **Analytics** 📊
   - How did I sleep this week?
   - Mood trending up or down?
   - Work hours balanced?

### Weekly Review:
1. **Analytics** → Last 7 days
   - Review mood trend
   - Check sleep average
   - Assess work-life balance

2. **Recommendations** → Generate New
   - Get fresh AI suggestions
   - Plan week based on patterns

3. **Notifications** → Clear Read
   - Start fresh for new week

### Monthly Check-In:
1. **Analytics** → Last 30 days
   - Long-term mood patterns
   - Sleep quality trends
   - Workload overview

2. **Export CSV**
   - Download monthly data
   - Track progress over time
   - Share with wellness coach

---

## 🎨 Visual Quick Reference

### Navbar Icons:
```
🏠 Dashboard    📅 Scheduler   💪 Wellness+   👥 Circles
⚠️ Burnout      ✨ For You     📊 Analytics   🤖 Assistant
🔔 Notifications(3)  🏆 Achievements  ⚙️ Settings
```

### Priority Colors:
- 🔴 **Red/Destructive** - High priority, urgent
- 🟡 **Yellow/Default** - Medium priority
- 🟢 **Green/Secondary** - Low priority, suggestions

### Status Indicators:
- ↑ **Trending Up** - Improving metrics
- ↓ **Trending Down** - Declining metrics
- ✓ **Completed** - Done/Read
- ⚠️ **Warning** - Needs attention

---

## 💡 Pro Tips

### For Best Results:
1. **Log Daily**:
   - Mood & energy in Wellness+
   - Sleep hours each morning
   - Update shifts in Scheduler

2. **Check Notifications** regularly
   - At least once per shift
   - Mark as read to stay organized

3. **Review Recommendations** weekly
   - Every Sunday or Monday
   - Plan week based on AI suggestions

4. **Monitor Analytics** monthly
   - Spot long-term patterns
   - Adjust habits based on data

### Data Quality:
- **7+ days** of logs → Good recommendations
- **14+ days** → Great pattern detection
- **30+ days** → Excellent AI insights

---

## 🚀 Next Steps

### Today:
1. ✅ Check out Notifications page
2. ✅ Generate your first recommendations
3. ✅ Explore analytics charts

### This Week:
1. Log mood/sleep daily
2. Add shifts to scheduler
3. Check notifications regularly

### This Month:
1. Review 30-day analytics
2. Export data to track progress
3. Adjust habits based on insights

---

**Enjoy your fully-featured wellness app! 🎉**  
**Questions? Check COMPLETION_SUMMARY.md for full details.**
