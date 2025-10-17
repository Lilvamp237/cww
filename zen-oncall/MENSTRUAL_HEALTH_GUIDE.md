# Menstrual Health Tracker - Setup & Usage Guide 🌸

## 🎯 Overview
The comprehensive menstrual health tracker helps users monitor their cycle, log symptoms, track patterns, and receive personalized wellness tips based on their cycle phase.

## 📋 Features

### 1. **Cycle Tracking**
- Track cycle start date, length, and period duration
- Automatic prediction of next period
- Visual cycle day counter
- Phase detection (Menstrual, Follicular, Ovulation, Luteal)

### 2. **Daily Symptom Logging**
- Flow level tracking (Light, Medium, Heavy, Spotting, None)
- 12 common symptom options with emojis:
  - 🤕 Cramps
  - 😩 Headache
  - 🤢 Nausea
  - 😴 Fatigue
  - 🥴 Bloating
  - 😢 Mood Swings
  - 🔥 Hot Flashes
  - 🍔 Cravings
  - 😣 Back Pain
  - 💤 Insomnia
  - 😰 Anxiety
  - 🌊 Heavy Flow

### 3. **Mood & Energy Tracking**
- 5-level mood scale with emojis
- Energy slider (1-5 scale)
- Optional notes field

### 4. **Phase-Specific Wellness Tips**
Each cycle phase provides customized wellness advice:

**🌊 Menstrual Phase (Days 1-5)**
- Rest is crucial - listen to your body
- Stay hydrated and eat iron-rich foods
- Gentle movement like walking or yoga
- Use heat therapy for cramps

**🌱 Follicular Phase (Days 6-13)**
- Energy levels rising - great for intense workouts
- Try new activities or start projects
- Focus on protein-rich foods
- Social activities more enjoyable

**✨ Ovulation Phase (Days 14-17)**
- Peak energy and mood
- Communication skills enhanced
- Great time for important conversations
- Stay mindful of increased confidence

**🌙 Luteal Phase (Days 18-28)**
- Practice self-care as energy may dip
- Complex carbs help with cravings
- Prioritize sleep and rest
- Gentle exercise like stretching

### 5. **Pattern Analysis**
- Most common symptoms tracking
- Average energy by phase (requires 7+ logs)
- Historical data visualization
- Trend identification

## 🗄️ Database Schema

### `menstrual_cycles` Table
```sql
- id (BIGSERIAL, PRIMARY KEY)
- user_id (UUID, REFERENCES auth.users)
- cycle_start_date (DATE)
- cycle_length (INTEGER, DEFAULT 28)
- period_length (INTEGER, DEFAULT 5)
- predicted_next_period (DATE, auto-calculated)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### `menstrual_logs` Table
```sql
- id (BIGSERIAL, PRIMARY KEY)
- user_id (UUID, REFERENCES auth.users)
- log_date (DATE)
- cycle_day (INTEGER)
- flow_level (TEXT, CHECK constraint)
- symptoms (TEXT[])
- mood (TEXT)
- energy_level (INTEGER, 1-5)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## 🚀 Setup Instructions

### Step 1: Run Database Migration
Execute the SQL file in your Supabase SQL Editor:
```bash
create-menstrual-health-tables.sql
```

This will:
- Create `menstrual_cycles` and `menstrual_logs` tables
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Add auto-update triggers for predicted dates

### Step 2: Verify Tables
Check in Supabase Table Editor that both tables exist with proper columns.

### Step 3: Test RLS Policies
Make sure authenticated users can:
- ✅ View only their own data
- ✅ Insert their own logs
- ✅ Update their own data
- ✅ Delete their own data

### Step 4: Access the Feature
Navigate to: `/menstrual-health` in your app

## 📱 User Flow

### First-Time User
1. Click "Start Tracking Cycle" button
2. System creates initial cycle with default 28-day length
3. User can begin logging daily symptoms

### Daily Logging
1. Navigate to "Daily Log" tab
2. Select flow level (if applicable)
3. Choose any relevant symptoms (multi-select)
4. Pick overall mood
5. Set energy level with slider
6. Add optional notes
7. Click "Save Daily Log"

### Viewing History
1. Navigate to "History" tab
2. See all logs from past 30 days
3. Each log shows:
   - Date and cycle day
   - Flow level and energy
   - Mood and symptoms
   - Personal notes

### Pattern Analysis
1. Navigate to "Patterns" tab
2. View most common symptoms (requires 7+ logs)
3. See average energy by phase
4. Identify trends over time

## 🎨 UI Components

### Color Scheme
- **Pink Gradient**: Primary branding (`from-pink-500 to-purple-500`)
- **Phase Colors**:
  - Menstrual: Red to Pink (`from-red-500 to-pink-500`)
  - Follicular: Green to Emerald (`from-green-500 to-emerald-500`)
  - Ovulation: Yellow to Orange (`from-yellow-500 to-orange-500`)
  - Luteal: Purple to Violet (`from-purple-500 to-violet-500`)

### Key Features
- Responsive grid layout (1 col mobile, 4 col desktop)
- Interactive symptom buttons with multi-select
- Real-time energy slider
- Gradient wellness tip cards
- Badge-based symptom display

## 🔧 Technical Details

### Dependencies
- **date-fns**: For date calculations and formatting
- **Supabase**: Database and authentication
- **Shadcn UI**: Card, Button, Badge, Tabs components
- **Lucide React**: Icons (Calendar, Heart, Activity, etc.)

### Key Functions
```typescript
getCurrentPhase(): CyclePhase
  // Calculates current phase based on cycle day

getCurrentCycleDay(): number
  // Returns current day in cycle (1-28)

getPredictedNextPeriod(): string
  // Calculates next period date

getPhaseInfo(phase): PhaseData
  // Returns phase-specific tips and styling
```

### State Management
- `currentCycle`: Active cycle data
- `recentLogs`: Last 30 days of logs
- `selectedSymptoms`: Multi-select symptom array
- `flowLevel`, `mood`, `energyLevel`, `notes`: Form states

## 📊 Data Privacy

### Row Level Security (RLS)
- Users can **only** access their own data
- All tables have user_id foreign key to auth.users
- Policies enforce user-specific queries
- No cross-user data leakage possible

### Best Practices
- Sensitive health data stays private
- Automatic CASCADE delete on user account deletion
- Timestamps track all changes
- UNIQUE constraints prevent duplicate logs

## 🐛 Troubleshooting

### "No cycles found"
- User needs to click "Start Tracking Cycle" first
- Check if user is authenticated
- Verify RLS policies allow INSERT

### "Error saving log"
- Check for duplicate log_date (UNIQUE constraint)
- Ensure energy_level is 1-5
- Verify flow_level is one of allowed values
- Check user authentication

### Pattern Analysis not showing
- Requires at least 7 logs for meaningful patterns
- Check if logs have symptom data
- Verify date range (last 30 days)

## 🎯 Future Enhancements

### Potential Additions
1. **Export Data**: Download logs as CSV/PDF
2. **Reminders**: Push notifications for daily logging
3. **Advanced Analytics**: Correlation charts (mood vs cycle day)
4. **Custom Symptoms**: User-defined symptom tracking
5. **Partner Sharing**: Optional sharing with healthcare provider
6. **Cycle Predictions**: ML-based irregular cycle detection
7. **Integration**: Connect with wearables (sleep, activity data)

## 📝 Usage Tips

### For Best Results
1. **Log Daily**: Consistency improves pattern accuracy
2. **Be Detailed**: More symptom data = better insights
3. **Track Energy**: Helps optimize work schedules
4. **Use Notes**: Record context (stress, diet, exercise)
5. **Review Patterns**: Check monthly for trends

### Healthcare Integration
- Export logs for doctor appointments
- Track symptom severity over time
- Identify triggers for specific symptoms
- Monitor treatment effectiveness

## 🌟 Success Metrics

### User Engagement
- Track daily logging frequency
- Monitor completion of all fields
- Measure pattern analysis views
- Survey user satisfaction

### Health Outcomes
- Symptom awareness improvement
- Better cycle prediction accuracy
- Enhanced self-care behaviors
- Reduced symptom severity (self-reported)

---

**Built with 💜 for comprehensive menstrual health tracking**

*Part of the CareSync healthcare wellness platform*
