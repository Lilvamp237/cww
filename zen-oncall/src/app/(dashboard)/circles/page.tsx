// src/app/(dashboard)/circles/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateCircleForm, JoinCircleForm } from './circle-forms'; // Import our new client components

export default async function CirclesPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: circles } = await supabase.from('circles').select('id, name');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sync Circles</h1>
      <p className="text-gray-600">Collaborate with your team, share schedules, and coordinate breaks.</p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Circle</CardTitle>
            <CardDescription>Start a new group for your unit or department.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCircleForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join an Existing Circle</CardTitle>
            <CardDescription>Enter an invite code to join a team.</CardDescription>
          </CardHeader>
          <CardContent>
            <JoinCircleForm />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Circles</h2>
        <div className="space-y-4">
          {circles && circles.length > 0 ? (
            circles.map(circle => (
              <Link key={circle.id} href={`/circles/${circle.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardHeader><CardTitle>{circle.name}</CardTitle></CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground">You are not a member of any circles yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}