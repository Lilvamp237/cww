// src/app/(dashboard)/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, HeartPulseIcon, FlameIcon } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome, {session.user.email?.split('@')[0]}!</h1>
      <p className="text-gray-600">Your central hub for Zen_OnCall. Quick insights and actions.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Schedule</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today: 1 Shift</div>
            <p className="text-xs text-muted-foreground">8 AM - 4 PM (ER Duty)</p>
            <Button asChild className="mt-4">
              <Link href="/scheduler">View Full Schedule</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mood Check-in</CardTitle>
            <HeartPulseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Feeling: Good 😊</div>
            <p className="text-xs text-muted-foreground">+5% vs last week</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/wellness">Log Your Mood</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Burnout Risk</CardTitle>
            <FlameIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Low</div>
            <p className="text-xs text-muted-foreground">Stay vigilant!</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/wellness">View Trends</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}