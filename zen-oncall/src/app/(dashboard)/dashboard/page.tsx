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

  const [{ data: shifts }, { data: moodLogs }] = await Promise.all([shiftsPromise, moodLogsPromise]);
  const safeShifts = shifts || [];
  const safeMoodLogs = moodLogs || [];

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {session.user.email?.split('@')[0]}!</h1>
      <p className="text-gray-600">Your central hub for Zen_OnCall. Quick insights and actions.</p>

      {/* --- Top Row Summary Cards (Your existing layout) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Schedule</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {todaysShift ? (
              <>
                <div className="text-2xl font-bold">Shift Today</div>
                <p className="text-xs text-muted-foreground">{new Date(todaysShift.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(todaysShift.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              </>
            ) : (
              <div className="text-2xl font-bold">Day Off</div>
            )}
            <Button asChild className="mt-4 w-full"><Link href="/scheduler">View Full Schedule</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mood Check-in</CardTitle>
            <HeartPulseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestMoodLog ? (
              <>
                <div className="text-2xl font-bold">Last Logged: {latestMoodLog.mood_score}/5</div>
                <p className="text-xs text-muted-foreground">Energy: {latestMoodLog.energy_level}/5</p>
              </>
            ) : (
              <div className="text-2xl font-bold">No logs yet</div>
            )}
            <Button asChild variant="outline" className="mt-4 w-full"><Link href="/wellness">Log Your Mood</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Burnout Risk</CardTitle>
            <BurnoutIcon className={`h-4 w-4 text-muted-foreground ${burnoutRisk.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${burnoutRisk.color}`}>{burnoutRisk.level}</div>
            <p className="text-xs text-muted-foreground">{burnoutRisk.message}</p>
            <Button asChild variant="outline" className="mt-4 w-full"><Link href="/wellness">View Trends</Link></Button>
          </CardContent>
        </Card>
      </div>

      {/* --- NEW: Analytics Charts Section --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MoodChart data={moodChartData} />
        <WorkLifeChart data={workLifeChartData} />
      </div>
    </div>
  );
}