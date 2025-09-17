// src/app/(dashboard)/circles/[circleId]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon } from 'lucide-react';

// Let TypeScript infer the type directly from the query for maximum accuracy
// We'll define the expected shape for clarity, but the real power is in inference.
type CircleWithMembers = {
  id: number;
  name: string;
  invite_code: string;
  circle_members: {
    profiles: {
      id: string;
      full_name: string | null;
    } | null;
  }[];
};

export default async function CircleDetailPage({ params }: { params: { circleId: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // The query fetches the circle and its members, and for each member, it fetches their profile.
  const { data: circle } = await supabase
    .from('circles')
    .select(`
      id,
      name,
      invite_code,
      circle_members (
        profiles ( id, full_name )
      )
    `)
    .eq('id', params.circleId)
    .single<CircleWithMembers>(); // <-- Tell Supabase the expected shape

  if (!circle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{circle.name}</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Invite Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>Invite Code</CardTitle>
            <CardDescription>Share this code to invite colleagues.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono bg-muted p-4 rounded-md text-center select-all">{circle.invite_code}</p>
          </CardContent>
        </Card>

        {/* Members List Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Members ({circle.circle_members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {circle.circle_members.length > 0 ? (
              <ul className="space-y-3">
                {circle.circle_members.map(member => {
                  // Check if the profile exists for this member before rendering
                  if (!member.profiles) return null;

                  return (
                    <li key={member.profiles.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                        {member.profiles.full_name ? member.profiles.full_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span>{member.profiles.full_name || 'Unnamed User'}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
               <p className="text-muted-foreground">No members yet. Share the invite code!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}