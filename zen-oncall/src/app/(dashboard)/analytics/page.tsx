// src/app/(dashboard)/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  DownloadIcon,
  Loader2Icon,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

type DateRange = '7d' | '30d' | '90d' | 'custom';

export default function AnalyticsPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  
  // Data states
  const [moodData, setMoodData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>({});

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRangeDates = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      startDate = customStartDate;
      endDate = customEndDate;
    } else {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      startDate = subDays(now, days);
    }

    return { startDate, endDate };
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { startDate, endDate } = getDateRangeDates();

    try {
      // Fetch all data in parallel
      const [moods, sleep, shifts, tasks] = await Promise.all([
        supabase
          .from('mood_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', startDate.toISOString())
          .lte('log_date', endDate.toISOString())
          .order('log_date'),
        
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('log_date', startDate.toISOString())
          .lte('log_date', endDate.toISOString())
          .order('log_date'),
        
        supabase
          .from('shifts')
          .select('*')
          .eq('user_id', user.id)
          .gte('shift_date', startDate.toISOString())
          .lte('shift_date', endDate.toISOString())
          .order('shift_date'),
        
        supabase
          .from('personal_tasks')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
      ]);

      // Process mood data
      const moodChartData = (moods.data || []).map((m) => ({
        date: format(new Date(m.log_date), 'MMM dd'),
        mood: m.mood_score,
        energy: m.energy_level,
      }));
      setMoodData(moodChartData);

      // Process sleep data
      const sleepChartData = (sleep.data || []).map((s) => ({
        date: format(new Date(s.log_date), 'MMM dd'),
        hours: s.sleep_hours,
        quality: s.sleep_quality,
      }));
      setSleepData(sleepChartData);

      // Process workload data
      const shiftsByDate = new Map<string, number>();
      (shifts.data || []).forEach((shift) => {
        const date = format(new Date(shift.shift_date), 'MMM dd');
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        shiftsByDate.set(date, (shiftsByDate.get(date) || 0) + hours);
      });

      const workloadChartData = Array.from(shiftsByDate.entries()).map(([date, hours]) => ({
        date,
        hours: Math.round(hours * 10) / 10,
      }));
      setWorkloadData(workloadChartData);

      // Process correlation data (mood vs workload)
      const correlationMap = new Map<string, any>();
      (moods.data || []).forEach((m) => {
        const date = format(new Date(m.log_date), 'MMM dd');
        correlationMap.set(date, { date, mood: m.mood_score, hours: 0 });
      });
      
      Array.from(shiftsByDate.entries()).forEach(([date, hours]) => {
        const existing = correlationMap.get(date) || { date, mood: 0, hours: 0 };
        existing.hours = Math.round(hours * 10) / 10;
        correlationMap.set(date, existing);
      });

      setCorrelationData(Array.from(correlationMap.values()));

      // Calculate summary stats
      const avgMood =
        (moods.data?.reduce((sum, m) => sum + m.mood_score, 0) || 0) /
        (moods.data?.length || 1);
      const avgEnergy =
        (moods.data?.reduce((sum, m) => sum + m.energy_level, 0) || 0) /
        (moods.data?.length || 1);
      const avgSleep =
        (sleep.data?.reduce((sum, s) => sum + s.sleep_hours, 0) || 0) /
        (sleep.data?.length || 1);
      const totalHours = Array.from(shiftsByDate.values()).reduce((a, b) => a + b, 0);
      const completedTasks = tasks.data?.filter((t) => t.completed).length || 0;
      const totalTasks = tasks.data?.length || 0;

      setSummaryStats({
        avgMood: avgMood.toFixed(1),
        avgEnergy: avgEnergy.toFixed(1),
        avgSleep: avgSleep.toFixed(1),
        totalHours: Math.round(totalHours),
        completedTasks,
        totalTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    }

    setLoading(false);
  };

  const exportData = () => {
    // Create CSV content
    const csvRows = [
      ['Date', 'Mood', 'Energy', 'Sleep Hours', 'Sleep Quality', 'Work Hours'],
      ...correlationData.map((row) => [
        row.date,
        row.mood || '',
        row.energy || '',
        sleepData.find((s) => s.date === row.date)?.hours || '',
        sleepData.find((s) => s.date === row.date)?.quality || '',
        row.hours || '',
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `wellness-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Analytics exported successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your wellness trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {customStartDate && customEndDate
                    ? `${format(customStartDate, 'MMM dd')} - ${format(customEndDate, 'MMM dd')}`
                    : 'Select dates'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3">
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={setCustomStartDate}
                  />
                  <p className="text-sm font-medium mt-4 mb-2">End Date</p>
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={setCustomEndDate}
                  />
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button onClick={exportData} variant="outline">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          label="Avg Mood"
          value={summaryStats.avgMood}
          suffix="/5"
          trend={parseFloat(summaryStats.avgMood) >= 3.5 ? 'up' : 'down'}
        />
        <StatCard
          label="Avg Energy"
          value={summaryStats.avgEnergy}
          suffix="/5"
          trend={parseFloat(summaryStats.avgEnergy) >= 3.5 ? 'up' : 'down'}
        />
        <StatCard
          label="Avg Sleep"
          value={summaryStats.avgSleep}
          suffix="h"
          trend={parseFloat(summaryStats.avgSleep) >= 7 ? 'up' : 'down'}
        />
        <StatCard
          label="Work Hours"
          value={summaryStats.totalHours}
          suffix="h"
        />
        <StatCard
          label="Tasks Done"
          value={summaryStats.completedTasks}
          suffix={`/${summaryStats.totalTasks}`}
        />
        <StatCard
          label="Completion"
          value={summaryStats.completionRate}
          suffix="%"
          trend={summaryStats.completionRate >= 70 ? 'up' : 'down'}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="mood" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
          <TabsTrigger value="sleep">Sleep Analysis</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="correlation">Correlations</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood & Energy Trends</CardTitle>
              <CardDescription>Track your emotional wellbeing over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Mood Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Energy Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sleep Analytics</CardTitle>
              <CardDescription>Monitor your sleep duration and quality</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="hours" fill="#6366f1" name="Sleep Hours" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="quality"
                    stroke="#ec4899"
                    strokeWidth={2}
                    name="Sleep Quality (/5)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Hours Analysis</CardTitle>
              <CardDescription>Track your daily work hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#10b981" name="Work Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wellness vs Workload Correlation</CardTitle>
              <CardDescription>
                See how your work hours affect your mood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={correlationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" domain={[0, 5]} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="hours"
                    fill="#f59e0b"
                    stroke="#f59e0b"
                    fillOpacity={0.3}
                    name="Work Hours"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="mood"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Mood Score"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  trend,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: 'up' | 'down';
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            {value}
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </span>
          {trend && (
            trend === 'up' ? (
              <TrendingUpIcon className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDownIcon className="w-5 h-5 text-orange-500" />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
