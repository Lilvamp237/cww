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
import { CircleFeatures } from './circle-features';

type CircleMember = {
  id: string;
  full_name: string | null;
  share_shifts: boolean;
  share_status: boolean;
};

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

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Get the member user IDs with privacy settings
  const { data: memberData } = await supabase
    .from('circle_members')
    .select('user_id, share_shifts, share_status')
    .eq('circle_id', circleIdNumber);

  console.log('Circle ID:', circleIdNumber);
  console.log('Circle data:', circle);
  console.log('Member IDs:', memberData);

  // Get the profiles for those user IDs
  let profiles: CircleMember[] = [];
  if (memberData && memberData.length > 0) {
    const userIds = memberData.map(m => m.user_id);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
    
    if (profileData) {
      profiles = profileData.map(profile => {
        const memberSettings = memberData.find(m => m.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          share_shifts: memberSettings?.share_shifts ?? true,
          share_status: memberSettings?.share_status ?? true,
        };
      });
    }
  }

  // Transform the data to match the expected type
  const circleWithMembers: CircleWithMembers = {
    ...circle,
    circle_members: profiles.map(profile => ({
      profiles: {
        id: profile.id,
        full_name: profile.full_name,
      }
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

        {/* Quick Actions Card - Kept for reference */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your circle and team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Use the tabs below to view schedules, post announcements, and manage shift swaps.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Circle Features */}
      <CircleFeatures
        circleId={circleWithMembers.id}
        members={profiles}
        currentUserId={user.id}
      />
    </div>
  );
}
