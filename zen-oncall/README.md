# CareSync 🏥

**Healthcare team coordination and burnout management platform for medical professionals**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)

> 🏆 **1st Runner-Up at Code with WIE 2025**  
> Competition organized by IEEE WIE Affinity Group of Sri Lanka

---

## 📖 About

CareSync is a comprehensive healthcare team coordination and burnout management platform designed to help medical professionals manage their schedules, track wellness goals, and collaborate effectively with their teams. Built specifically for healthcare workers juggling demanding shifts, personal wellness, and team coordination.

### Key Features

- 🗓️ **Smart Scheduling** - Manage work shifts and personal time in one unified calendar
- 👥 **Sync Circles** - Create and join teams for seamless collaboration
- 🔄 **Shift Swaps** - Request and manage shift exchanges with team members
- 📢 **Team Announcements** - Keep everyone informed with priority-based notifications
- 🌱 **Wellness Tracking** - Monitor personal tasks, habits, and self-care goals
- 📊 **Habit Logs** - Track daily progress on health and wellness habits
- 🔒 **Privacy Controls** - Choose what to share with your circles
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## 🚀 Tech Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library with Server Components
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Secure authentication system
- **Row Level Security (RLS)** - Database-level security policies

### Additional Tools
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **date-fns** - Date utilities

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/Lilvamp237/cww.git
cd cww/zen-oncall
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**To get these values:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 4. Set Up the Database

Run these SQL scripts in your Supabase SQL Editor **in order**:

1. **`database-schema-updates.sql`** - Creates tables and RLS policies
2. **`quick-fix.sql`** - Sets up profiles and triggers
3. **`insert-dummy-data-4-USERS.sql`** (Optional) - Adds test data for 4 users

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

### Core Tables

- **`profiles`** - User profile information
- **`circles`** - Team/group coordination
- **`circle_members`** - Membership and privacy settings
- **`shifts`** - Work and personal time blocks
- **`personal_tasks`** - Individual task management
- **`habits`** - Wellness habit tracking
- **`habit_logs`** - Daily habit progress
- **`circle_announcements`** - Team communication
- **`shift_swaps`** - Shift exchange requests

All tables include Row Level Security (RLS) policies to ensure users only access their authorized data.

---

## 🎨 Features in Detail

### 📅 Scheduler
- Unified calendar view for work and personal time
- Color-coded shifts by category
- See team members' schedules (if they've enabled sharing)
- Add, edit, and delete shifts
- Filter by circle or category

### 👥 Sync Circles
- Create teams for departments, shifts, or projects
- Invite members with unique codes
- View all team members with avatars
- Admin controls for circle management
- Privacy settings (share shifts, share status)

### 🔄 Shift Swaps
- Request shift swaps with specific team members
- Accept or decline incoming requests
- Add messages and notes
- Track swap status (pending, accepted, declined)

### 📢 Announcements
- Post updates to your circles
- Priority levels (normal, high, urgent)
- See author and timestamp
- Circle-specific communication

### 🌱 Wellness Dashboard
- **Tasks**: Organize personal to-dos with priorities and categories
- **Habits**: Set daily/weekly goals with custom icons
- **Tracking**: Log habit completion with notes
- **Progress**: Visualize streaks and completion rates

---

## 👤 User Flow

### New User Signup
1. Sign up with email
2. Profile automatically created via database trigger
3. Start with empty dashboard
4. Create or join circles
5. Add shifts and wellness goals

### Existing User Login
1. Log in with credentials
2. View personalized dashboard
3. See upcoming shifts and tasks
4. Check circle announcements
5. Respond to shift swap requests

---

## 🔒 Security

- **Authentication**: Supabase Auth with email/password
- **Row Level Security**: All tables protected with RLS policies
- **Privacy Controls**: Users control what team members see
- **Secure API**: Server-side rendering with auth checks

---

## 📱 Responsive Design

CareSync works beautifully across all devices:

- **Desktop**: Full-featured dashboard with sidebar navigation
- **Tablet**: Optimized layouts for medium screens
- **Mobile**: Touch-friendly interface with hamburger menu

---

## 🧪 Testing with Dummy Data

The repository includes `insert-dummy-data-4-USERS.sql` which creates:

- 4 doctor profiles with avatars
- 2 circles (Emergency Department + ICU)
- 15 shifts across all users
- Personal tasks and habits
- Circle announcements
- Shift swap requests in various states

Perfect for testing multi-user interactions and team features!

---

## 🚧 Roadmap

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Calendar export (iCal)
- [ ] Advanced analytics
- [ ] Team performance metrics
- [ ] Burnout prediction AI
- [ ] Integration with hospital systems

---

## 🤝 Contributing

This project was developed for Code with WIE 2025 competition. For contributions or suggestions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

© 2025 CareSync Team. All rights reserved.

This project is the intellectual property of the CareSync development team.

---

## 👨‍💻 Authors

**Lilvamp237**  
GitHub: [@Lilvamp237](https://github.com/Lilvamp237)

**Wicky2002**  
GitHub: [@Wicky2002](https://github.com/Wicky2002)

---

**Built with ❤️ for healthcare professionals**
