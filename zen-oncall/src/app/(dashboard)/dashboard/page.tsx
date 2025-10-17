// src/app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { differenceInHours, subDays, startOfDay, format, eachWeekOfInterval, endOfWeek, isWithinInterval } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, HeartPulseIcon } from 'lucide-react';
import { calculateBurnoutScore } from '@/lib/burnout';
import { MoodChart } from '@/components/charts/mood-chart';
import { WorkLifeChart } from '@/components/charts/work-life-chart';
import { createServerClient } from '@/lib/supabase/server';

// Define types for data fetched from Supabase
type Shift = { start_time: string; end_time: string; };
type MoodLog = { mood_score: number; energy_level: number; log_date: string; };

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // --- 1. DATA FETCHING: Get data for the last 30 days ---
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  
  const shiftsPromise = supabase.from('shifts').select('start_time, end_time').eq('user_id', session.user.id).gte('start_time', thirtyDaysAgo);
  const moodLogsPromise = supabase.from('mood_logs').select('mood_score, energy_level, log_date').eq('user_id', session.user.id).gte('log_date', thirtyDaysAgo);
  const profilePromise = supabase.from('profiles').select('full_name').eq('id', session.user.id).single();

  const [{ data: shifts }, { data: moodLogs }, { data: profile }] = await Promise.all([shiftsPromise, moodLogsPromise, profilePromise]);
  const safeShifts = shifts || [];
  const safeMoodLogs = moodLogs || [];
  
  // Get display name - prioritize full_name from profile, fallback to email
  const displayName = profile?.full_name || session.user.email?.split('@')[0] || 'there';

  // --- 2. DATA PROCESSING ---

  // A. Process for Summary Cards
  const burnoutRisk = calculateBurnoutScore(safeShifts, safeMoodLogs);
  const BurnoutIcon = burnoutRisk.icon;
  const todayStart = startOfDay(new Date()).toISOString().split('T')[0];
  const todaysShift = safeShifts.find(s => new Date(s.start_time).toISOString().startsWith(todayStart));
  const latestMoodLog = safeMoodLogs.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())[0];

  // B. Process for Mood Chart
  const moodChartData = safeMoodLogs.map(log => ({
    date: format(new Date(log.log_date), 'MMM d'),
    mood: log.mood_score,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // C. Process for Work-Life Chart
  const workLifeChartData = eachWeekOfInterval({
    start: subDays(new Date(), 28),
    end: new Date(),
  }, { weekStartsOn: 1 }).map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekLabel = `${format(weekStart, 'MMM d')}`;

    const shiftsInWeek = safeShifts.filter(s => isWithinInterval(new Date(s.start_time), { start: weekStart, end: weekEnd }));
    const logsInWeek = safeMoodLogs.filter(l => isWithinInterval(new Date(l.log_date), { start: weekStart, end: weekEnd }));

    const totalHours = shiftsInWeek.reduce((acc, shift) => acc + differenceInHours(new Date(shift.end_time), new Date(shift.start_time)), 0);
    const avgEnergy = logsInWeek.length > 0 ? logsInWeek.reduce((acc, log) => acc + log.energy_level, 0) / logsInWeek.length : null;

    return {
      week: weekLabel,
      hours: totalHours,
      energy: avgEnergy ? parseFloat(avgEnergy.toFixed(1)) : null,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg animate-in slide-in-from-left duration-500">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="mt-2 text-lg text-cyan-50 animate-in slide-in-from-left duration-700 delay-100">
            Your personalized wellness command center. Let&apos;s make today great!
          </p>
        </div>
      </div>

      {/* Top Row Summary Cards with Hover Animations */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-cyan-500 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">My Schedule</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-2 group-hover:scale-110 transition-transform duration-300">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {todaysShift ? (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Shift Today</div>
                <p className="mt-1 text-sm text-slate-500 font-medium">{new Date(todaysShift.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(todaysShift.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              </>
            ) : (
              <div className="text-3xl font-bold text-emerald-600">Day Off 🌴</div>
            )}
            <Button asChild className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300">
              <Link href="/scheduler">View Full Schedule</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-violet-500 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-150">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Mood Check-in</CardTitle>
            <div className="rounded-full bg-gradient-to-br from-violet-500 to-purple-600 p-2 group-hover:scale-110 transition-transform duration-300">
              <HeartPulseIcon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {latestMoodLog ? (
              <>
                <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {latestMoodLog.mood_score}/5 {['😢', '😕', '😐', '😊', '😄'][latestMoodLog.mood_score - 1]}
                </div>
                <p className="mt-1 text-sm text-slate-500 font-medium">Energy: {latestMoodLog.energy_level}/5 ⚡</p>
              </>
            ) : (
              <div className="text-3xl font-bold text-slate-400">No logs yet</div>
            )}
            <Button asChild variant="outline" className="mt-4 w-full border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400 transition-all duration-300">
              <Link href="/wellness">Log Your Mood</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-amber-500 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Burnout Risk</CardTitle>
            <div className={`rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-2 group-hover:scale-110 transition-transform duration-300`}>
              <BurnoutIcon className={`h-5 w-5 text-white`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${burnoutRisk.color}`}>{burnoutRisk.level}</div>
            <p className="mt-1 text-sm text-slate-500 font-medium">{burnoutRisk.message}</p>
            <Button asChild variant="outline" className="mt-4 w-full border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300">
              <Link href="/burnout">View Full Analysis</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section with Animations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-in fade-in-50 slide-in-from-left duration-700 delay-200">
          <MoodChart data={moodChartData} />
        </div>
        <div className="animate-in fade-in-50 slide-in-from-right duration-700 delay-200">
          <WorkLifeChart data={workLifeChartData} />
        </div>
      </div>
    </div>
  );
}