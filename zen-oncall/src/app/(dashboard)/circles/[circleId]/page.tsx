import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UsersIcon } from 'lucide-react';
import { InviteCodeCard } from './circle-actions';

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

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ circleId: string }>;
}) {
  const { circleId } = await params;

  const circleIdNumber = Number(circleId);
  if (isNaN(circleIdNumber)) notFound();

  const supabase = await createServerClient();

  // First get the circle
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select('id, name, invite_code')
    .eq('id', circleIdNumber)
    .single();

  if (circleError || !circle) {
    console.log('Circle ID:', circleIdNumber);
    console.log('Circle error:', circleError);
    notFound();
  }

  // Get the member user IDs
  const { data: memberIds, error: membersError } = await supabase
    .from('circle_members')
    .select('user_id')
    .eq('circle_id', circleIdNumber);

  console.log('Circle ID:', circleIdNumber);
  console.log('Circle data:', circle);
  console.log('Member IDs:', memberIds);

  // Get the profiles for those user IDs
  let profiles: Array<{ id: string; full_name: string | null }> = [];
  if (memberIds && memberIds.length > 0) {
    const userIds = memberIds.map(m => m.user_id);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    profiles = profileData || [];
  }

  // Transform the data to match the expected type
  const circleWithMembers: CircleWithMembers = {
    ...circle,
    circle_members: profiles.map(profile => ({
      profiles: profile
    }))
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{circleWithMembers.name}</h1>
        <div className="text-sm text-muted-foreground">
          Circle ID: {circleWithMembers.id}
        </div>
      </div>

      {/* Prominent Invite Section */}
      <InviteCodeCard inviteCode={circleWithMembers.invite_code} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Members List Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Team Members ({circleWithMembers.circle_members.length})
            </CardTitle>
            <CardDescription>
              Active members in this circle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {circleWithMembers.circle_members.length > 0 ? (
              <ul className="space-y-3">
                {circleWithMembers.circle_members.map((member) => {
                  if (!member.profiles) return null;
                  return (
                    <li
                      key={member.profiles.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-primary-foreground shadow-sm">
                        {member.profiles.full_name
                          ? member.profiles.full_name.charAt(0).toUpperCase()
                          : '?'}
                      </div>
                      <span className="font-medium">
                        {member.profiles.full_name || 'Unnamed User'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No members yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Share the invite code to get started!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your circle and team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full px-4 py-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">📅 View Team Schedule</div>
              <div className="text-sm text-muted-foreground">See everyone&apos;s shifts</div>
            </button>
            <button className="w-full px-4 py-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">💬 Team Chat</div>
              <div className="text-sm text-muted-foreground">Coordinate with your team</div>
            </button>
            <button className="w-full px-4 py-3 text-left rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="font-medium">📊 Circle Analytics</div>
              <div className="text-sm text-muted-foreground">View team wellness trends</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
