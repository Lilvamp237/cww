// src/app/(dashboard)/circles/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateCircleForm, JoinCircleForm } from './circle-forms';
import { createServerClient } from '@/lib/supabase/server'; // ✅ corrected import

export default async function CirclesPage() {
  const supabase = await createServerClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view circles.</div>;
  }

  // Fetch circles where the user is a member
  const { data: membershipData, error } = await supabase
    .from('circle_members')
    .select(`
      circles (
        id,
        name
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching circles:', error.message);
  }

  // Transform the data to get just the circles
  const userCircles = membershipData?.map(item => item.circles).filter(Boolean).flat() || [];

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
          {userCircles && userCircles.length > 0 ? (
            userCircles.map(circle => (
              <Link
                key={circle.id}
                // ✅ Convert ID to number for dynamic route
                href={`/circles/${Number(circle.id)}`}
              >
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
